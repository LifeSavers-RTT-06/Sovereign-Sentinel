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
        
        # Get the updated data from the request body
        body = json.loads(event['body'])
        
        # Update only the fields that were sent
        update_expression = 'SET '
        expression_values = {}
        expression_names = {}
        
        allowed_fields = ['quantity', 'expirationDate', 'itemName', 'unit', 'category']
        updates = []
        
        for field in allowed_fields:
            if field in body:
                placeholder = f'#f_{field}'
                value_placeholder = f':v_{field}'
                expression_names[placeholder] = field
                expression_values[value_placeholder] = body[field]
                updates.append(f'{placeholder} = {value_placeholder}')
        
        if not updates:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No valid fields to update'})
            }
        
        update_expression += ', '.join(updates)
        
        # Update the item in DynamoDB
        response = table.update_item(
            Key={
                'userID': user_id,
                'itemID': item_id
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values,
            ExpressionAttributeNames=expression_names,
            ReturnValues='ALL_NEW'
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'message': 'Item updated successfully',
                'item': response['Attributes']
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