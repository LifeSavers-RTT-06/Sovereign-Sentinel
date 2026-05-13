import json
import boto3
from boto3.dynamodb.conditions import Key
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['SUPPLIES_TABLE'])

def lambda_handler(event, context):
    try:
        # Get the user ID from the authenticated request
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # Query all supplies for this household
        response = table.query(
            KeyConditionExpression=Key('userID').eq(user_id)
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps(response['Items'])
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