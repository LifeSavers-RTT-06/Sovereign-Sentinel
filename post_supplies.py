import json
import boto3
import os
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['SUPPLIES_TABLE'])

def lambda_handler(event, context):
    try:
        # Get the user ID from the authenticated request
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # Get the item data from the request body
        body = json.loads(event['body'])
        
        # Build the new supply item
        new_item = {
            'userID': user_id,
            'itemID': str(uuid.uuid4()),
            'category': body['category'],
            'itemName': body['itemName'],
            'quantity': body['quantity'],
            'unit': body['unit'],
            'expirationDate': body['expirationDate'],
            'dateAdded': datetime.today().strftime('%Y-%m-%d')
        }
        
        # Save it to DynamoDB
        table.put_item(Item=new_item)
        
        return {
            'statusCode': 201,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'message': 'Item added successfully',
                'item': new_item
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