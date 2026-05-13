import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['SUPPLIES_TABLE'])

def lambda_handler(event, context):
    try:
        # Get the user ID from the authenticated request
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # Get the item ID from the URL path
        item_id = event['pathParameters']['itemID']
        
        # Delete the item from DynamoDB
        table.delete_item(
            Key={
                'userID': user_id,
                'itemID': item_id
            }
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'message': 'Item deleted successfully'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': str(e)})
        }