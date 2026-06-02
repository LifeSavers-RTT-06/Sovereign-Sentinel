import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const tableName = process.env.PROFILES_TABLE_NAME;
const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

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

function toProfileItem(body, userId) {
  return {
    userId,
    householdName: typeof body.householdName === 'string' ? body.householdName.trim() : '',
    householdSize: validatePositiveInteger(body.householdSize, 'householdSize'),
    preparednessGoalDays: validatePositiveInteger(
      body.preparednessGoalDays,
      'preparednessGoalDays',
    ),
    updatedAt: new Date().toISOString(),
  };
}

async function getProfile(userId) {
  const result = await dynamoDb.send(
    new GetCommand({
      TableName: tableName,
      Key: { userId },
    }),
  );

  return jsonResponse(200, result.Item ?? null);
}

async function putProfile(userId, event) {
  let body;

  try {
    body = parseRequestBody(event);
  } catch {
    return jsonResponse(400, { error: 'Request body must be valid JSON.' });
  }

  let profile;

  try {
    profile = toProfileItem(body, userId);
  } catch (error) {
    return jsonResponse(400, { error: error.message });
  }

  await dynamoDb.send(
    new PutCommand({
      TableName: tableName,
      Item: profile,
    }),
  );

  return jsonResponse(200, profile);
}

export async function handler(event) {
  if (!tableName) {
    return jsonResponse(500, { error: 'PROFILES_TABLE_NAME is not configured.' });
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

  if (!userId) {
    return jsonResponse(401, { error: 'Cognito user sub is required.' });
  }

  if (method === 'GET') {
    return getProfile(userId);
  }

  if (method === 'PUT') {
    return putProfile(userId, event);
  }

  return jsonResponse(405, { error: 'Method not allowed.' });
}
