Expiry Scanner System Integration

The Expiry Scanner is an internal automated worker designed to track household inventory lifecycles and push proactive alerts.

### 1. Invocation Engine (Amazon EventBridge)
The function operates completely decoupled from frontend actions via a time-based scheduler rule.
*   **Rule Source Type**: Time-based Cron Expression
*   **Expression**: `cron(0 8 * * ? *)` (Executes daily at exactly 8:00 AM UTC)
*   **Target Destination**: `PrepTrack-ExpiryScanner-Lambda`

#### Inbound Trigger Context
EventBridge passes a standard scheduling event object to the handler. The internal code execution logic ignores the content payload, evaluating the event purely as a wake-up signal:
```json
{
  "version": "0",
  "id": "12345678-1234-1234-1234-123456789012",
  "detail-type": "Scheduled Event",
  "source": "aws.events",
  "account": "AWS_ACCOUNT_ID",
  "time": "2026-05-21T08:00:00Z",
  "region": "us-east-1",
  "resources": [
    "arn:aws:events:us-east-1:AWS_ACCOUNT_ID:rule/trigger-expiry-scanner-daily"
  ],
  "detail": {}
}
```

### 2. Processing Data Logic
Upon activation, the function searches records using the primary database resource tracking variables.
*   **Evaluation Window Range**: `Today` to `Today + 14 Days`.
*   **Database Operation**: Executes a DynamoDB `Scan` using a filter expression: `Attr('expiryDate').between(today, warning_date)`.
*   **Aggregating Strategy**: Records that match are sorted into logical dictionary lists grouped by `householdId`. This data step ensures families receive a clean, single digest message rather than a separate notification flood for each item.

### 3. Outbound Notification Interface (Amazon SNS)
After processing target data variations, the function publishes an update payload to the notification tier.
*   **System Action**: Amazon Simple Notification Service (SNS) `Publish` API.
*   **Topic Target ARN**: `arn:aws:sns:us-east-1:AWS_ACCOUNT_ID:PrepTrack-ExpiryAlertTopic`
*   **Delivery Channel**: Confirmed subscriber emails.

#### Documented Output Message Footprint
*   **Subject Header**: `PrepTrack Alert — Items Expiring Soon`
*   **Message Body Structure**:
```text
Hello,

This is your PrepTrack emergency supply alert. The following items in your household are expiring within the next 14 days:

- Canned Black Beans | Quantity: 5 | Expires: 2026-05-28
- Ready-to-Eat Rice | Quantity: 3 | Expires: 2026-06-02

Please check your supplies and consider:
- Using these items in your regular meals
- Replacing them with fresh stock
- Updating your PrepTrack dashboard

Stay prepared,
The PrepTrack App
```
