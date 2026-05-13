import json
import boto3
import os
from datetime import datetime, timedelta
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

table = dynamodb.Table(os.environ['SUPPLIES_TABLE'])
sns_topic_arn = os.environ['SNS_TOPIC_ARN']

def lambda_handler(event, context):
    try:
        # Calculate today and the 14-day warning date
        today = datetime.today().strftime('%Y-%m-%d')
        warning_date = (datetime.today() + timedelta(days=14)).strftime('%Y-%m-%d')
        
        # Scan DynamoDB for all items expiring within 14 days
        response = table.scan(
            FilterExpression=Attr('expirationDate').between(today, warning_date)
        )
        
        expiring_items = response['Items']
        
        # If nothing is expiring, stop here — no email needed
        if not expiring_items:
            return {
                'statusCode': 200,
                'body': json.dumps('No items expiring soon. No alert sent.')
            }
        
        # Group items by household (userID)
        households = {}
        for item in expiring_items:
            user_id = item['userID']
            if user_id not in households:
                households[user_id] = []
            households[user_id].append(item)
        
        # Send one email per household
        for user_id, items in households.items():
            # Build the email message
            item_list = '\n'.join([
                f"- {item['itemName']} | "
                f"Quantity: {item['quantity']} {item['unit']} | "
                f"Expires: {item['expirationDate']}"
                for item in items
            ])
            
            message = f"""
Hello,

This is your PrepTrack emergency supply alert.

The following items in your household are expiring within the next 14 days:

{item_list}

Please check your supplies and consider:
- Using these items in your regular meals
- Replacing them with fresh stock
- Updating your PrepTrack dashboard

Stay prepared,
The PrepTrack App
            """
            
            # Send the email via SNS
            sns.publish(
                TopicArn=sns_topic_arn,
                Message=message,
                Subject='PrepTrack Alert — Items Expiring Soon'
            )
        
        return {
            'statusCode': 200,
            'body': json.dumps(
                f'Alerts sent for {len(households)} household(s). '
                f'{len(expiring_items)} item(s) expiring soon.'
            )
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }