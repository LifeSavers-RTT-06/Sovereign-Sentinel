import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, SetSubscriptionAttributesCommand, SubscribeCommand } from '@aws-sdk/client-sns';

const tableName = process.env.HOUSEHOLD_TABLE ?? process.env.PROFILES_TABLE_NAME;
const snsTopicArn = process.env.SNS_TOPIC_ARN;
const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const snsClient = new SNSClient({});
const profileSortKey = 'PROFILE';

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

function getCognitoSub(event) {
  return (
    event?.requestContext?.authorizer?.jwt?.claims?.sub ??
    event?.requestContext?.authorizer?.claims?.sub ??
    event?.requestContext?.authorizer?.lambda?.sub
  );
}

function getCognitoEmail(event) {
  return (
    event?.requestContext?.authorizer?.jwt?.claims?.email ??
    event?.requestContext?.authorizer?.claims?.email ??
    event?.requestContext?.authorizer?.lambda?.email
  );
}

function normalizePath(event) {
  return event?.rawPath ?? event?.path ?? '';
}

function normalizeMethod(event) {
  return event?.requestContext?.http?.method ?? event?.httpMethod ?? '';
}

function parseRequestBody(event) {
  if (!event.body) {
    return {};
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  return JSON.parse(rawBody);
}

function validatePositiveInteger(value, label) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }

  return parsedValue;
}

function withoutUndefinedValues(item) {
  return Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined));
}

function toProfileItem(body, userId, email, notificationState = {}) {
  const expiryAlertsEnabled = body.expiryAlertsEnabled === true;

  return withoutUndefinedValues({
    userId,
    SK: profileSortKey,
    householdName: typeof body.householdName === 'string' ? body.householdName.trim() : '',
    householdSize: validatePositiveInteger(body.householdSize, 'householdSize'),
    preparednessGoalDays: validatePositiveInteger(
      body.preparednessGoalDays,
      'preparednessGoalDays',
    ),
    expiryAlertsEnabled,
    notificationEmail: email,
    ...notificationState,
    updatedAt: new Date().toISOString(),
  });
}

function getProfileKey(userId) {
  return { userId, SK: profileSortKey };
}

async function loadProfile(userId) {
  const result = await dynamoDb.send(
    new GetCommand({
      TableName: tableName,
      Key: getProfileKey(userId),
    }),
  );

  return result.Item ?? null;
}

async function getProfile(userId) {
  const profile = await loadProfile(userId);

  return jsonResponse(200, { exists: Boolean(profile), profile });
}

function shouldSubscribe(existingProfile, email) {
  return !(
    existingProfile?.notificationEmail === email &&
    (existingProfile?.snsSubscriptionArn || existingProfile?.snsSubscriptionStatus)
  );
}

async function subscribeToExpiryAlerts(userId, email, existingProfile) {
  if (!snsTopicArn) {
    throw new Error('SNS_TOPIC_ARN is not configured.');
  }

  if (!email) {
    throw new Error('Cognito email claim is required to enable expiry alerts.');
  }

  if (!shouldSubscribe(existingProfile, email)) {
    return {
      snsSubscriptionArn: existingProfile.snsSubscriptionArn,
      snsSubscriptionStatus: existingProfile.snsSubscriptionStatus,
    };
  }

  const filterPolicy = JSON.stringify({ userId: [userId] });

  const subscription = await snsClient.send(
    new SubscribeCommand({
      TopicArn: snsTopicArn,
      Protocol: 'email',
      Endpoint: email,
      ReturnSubscriptionArn: true,
      Attributes: {
        FilterPolicy: filterPolicy,
        FilterPolicyScope: 'MessageAttributes',
      },
    }),
  );

  const subscriptionArn = subscription.SubscriptionArn;
  const isPendingConfirmation =
    !subscriptionArn || subscriptionArn.toLowerCase() === 'pending confirmation';

  if (!isPendingConfirmation) {
    await snsClient.send(
      new SetSubscriptionAttributesCommand({
        SubscriptionArn: subscriptionArn,
        AttributeName: 'FilterPolicy',
        AttributeValue: filterPolicy,
      }),
    );
    await snsClient.send(
      new SetSubscriptionAttributesCommand({
        SubscriptionArn: subscriptionArn,
        AttributeName: 'FilterPolicyScope',
        AttributeValue: 'MessageAttributes',
      }),
    );
  }

  return isPendingConfirmation
    ? { snsSubscriptionStatus: 'PendingConfirmation' }
    : { snsSubscriptionArn: subscriptionArn, snsSubscriptionStatus: 'Confirmed' };
}

async function putProfile(userId, email, event) {
  let body;

  try {
    body = parseRequestBody(event);
  } catch {
    return jsonResponse(400, { error: 'Request body must be valid JSON.' });
  }

  try {
    toProfileItem(body, userId, email);
  } catch (error) {
    return jsonResponse(400, { error: error.message });
  }

  const existingProfile = await loadProfile(userId);
  let notificationState = {};

  if (body.expiryAlertsEnabled === true) {
    try {
      notificationState = await subscribeToExpiryAlerts(userId, email, existingProfile);
    } catch (error) {
      return jsonResponse(500, { error: error.message });
    }
  } else {
    notificationState = {
      snsSubscriptionArn: existingProfile?.snsSubscriptionArn,
      snsSubscriptionStatus: existingProfile?.snsSubscriptionStatus,
      // TODO: Unsubscribe only when we can safely verify this user's current SNS subscription ARN.
    };
  }

  const profile = toProfileItem(body, userId, email, notificationState);

  await dynamoDb.send(
    new PutCommand({
      TableName: tableName,
      Item: profile,
    }),
  );

  return jsonResponse(200, { exists: true, profile });
}

export async function handler(event) {
  if (!tableName) {
    return jsonResponse(500, { error: 'HOUSEHOLD_TABLE is not configured.' });
  }

  const method = normalizeMethod(event);

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  const path = normalizePath(event);

  if (!path.endsWith('/profile')) {
    return jsonResponse(404, { error: 'Route not found.' });
  }

  const userId = getCognitoSub(event);
  const email = getCognitoEmail(event);

  if (!userId) {
    return jsonResponse(401, { error: 'Cognito user sub is required.' });
  }

  if (method === 'GET') {
    return getProfile(userId);
  }

  if (method === 'PUT') {
    return putProfile(userId, email, event);
  }

  return jsonResponse(405, { error: 'Method not allowed.' });
}
