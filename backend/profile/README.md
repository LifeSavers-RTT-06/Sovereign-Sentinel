# Household Profile Backend

This folder contains the `/profile` Lambda implementation and a CloudFormation template for adding profile persistence to the existing authenticated API Gateway API.

## Data model

The `ProfilesTable` DynamoDB table uses the Cognito `sub` as the partition key:

```json
{
  "userId": "Cognito sub",
  "householdName": "string",
  "householdSize": 1,
  "preparednessGoalDays": 14,
  "updatedAt": "ISO date string"
}
```

## Routes

- `GET /profile` returns the logged-in user's profile or `null` when no profile exists yet.
- `PUT /profile` creates or replaces the logged-in user's profile and returns the saved item.

The Lambda reads the user ID from API Gateway Cognito authorizer claims and never trusts a frontend-provided `userId`.

## Deployment notes

1. From this directory, run `npm install --omit=dev` and zip `handler.mjs`, `package.json`, and `node_modules/` at the zip root.
2. Upload the zip to S3.
3. Deploy `template.yaml` with the existing HTTP API ID, existing Cognito authorizer ID, and the S3 bucket/key for the packaged zip. Those API resources are the same authenticated API Gateway API that already serves the supplies routes.
4. Keep the frontend `VITE_API_BASE_URL` pointed at the same API base URL that serves `/supplies`, so the new `/profile` routes share the same authenticated domain.
