import {
  DynamoDBClient,
  ReturnValue,
} from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  NativeAttributeValue,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { LambdaFunctionURLEvent } from 'aws-lambda';

const dynamoDbClient = new DynamoDBClient({});

const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

const tableName = process.env.REVIEWS_TABLE_NAME;

export const handler = async (event: LambdaFunctionURLEvent) => {
  const path = event.requestContext.http.path;
  const method = event.requestContext.http.method;

  if (path === '/') {
    if (method === 'GET') {
      const params = {
        TableName: tableName,
      };

      let data = null;
      try {
        data = await dynamoDbDocClient.send(new ScanCommand(params));
      } catch (error) {
        console.error(`GET "/": DynamoDB Error: ${error}`);
        return { statusCode: 500 };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(data.Items),
      };
    } else if (method === 'POST') {
      if (typeof event.body !== 'string') {
        return { statusCode: 400 };
      }

      let newReview = null;
      try {
        newReview = JSON.parse(event.body);
      } catch {
        return { statusCode: 400 };
      }

      if (typeof newReview !== 'object' || typeof newReview.restaurant !== 'string' ||
          ![1, 2, 3, 4, 5].includes(newReview.stars)) {
        return { statusCode: 400 };
      }

      const date = new Date(newReview.date);
      if (isNaN(date.valueOf())) {
        return { statusCode: 400 };
      }

      let finalReviewObject = null;
      while (!finalReviewObject) {
        let reviewId = '';
        for (let i = 0; i < 5; i++) {
          reviewId += '0123456789ABCDEFGHJKMNPQRSTVWXYZ'[Math.floor(Math.random() * 32)];
        }

        finalReviewObject = {
          id: reviewId,
          date: date.toISOString().slice(0, 10),
          restaurant: newReview.restaurant,
          stars: newReview.stars,
        };

        const params = {
          TableName: tableName,
          Item: finalReviewObject,
          ConditionExpression: 'attribute_not_exists(id)',
        };

        try {
          await dynamoDbDocClient.send(new PutCommand(params));
        } catch (error) {
          if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
            finalReviewObject = null;
          } else {
            console.error(`POST "/": DynamoDB Error: ${error}`);
            return { statusCode: 500 };
          }
        }
      }

      return {
        statusCode: 201,
        body: JSON.stringify(finalReviewObject),
      };
    }
  } else {
    const reviewId = path.substring(1);

    if (method === 'GET') {
      const params = {
        TableName: tableName,
        Key: {
          id: reviewId,
        },
      };

      let data = null;
      try {
        data = await dynamoDbDocClient.send(new GetCommand(params));
      } catch (error) {
        console.error(`GET "/${reviewId}": DynamoDB Error: ${error}`);
        return { statusCode: 500 };
      }

      if (!('Item' in data)) {
        return { statusCode: 404 };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(data.Item),
      };
    } else if (method === 'DELETE') {
      const params = {
        TableName: tableName,
        Key: {
          id: reviewId,
        },
      };

      try {
        await dynamoDbDocClient.send(new DeleteCommand(params));
      } catch (error) {
        console.error(`DELETE "/${reviewId}": DynamoDB Error: ${error}`);
        return { statusCode: 500 };
      }

      return { statusCode: 204 };
    } else if (method === 'PATCH') {
      if (typeof event.body !== 'string') {
        return { statusCode: 400 };
      }

      let reviewUpdate = null;
      try {
        reviewUpdate = JSON.parse(event.body);
      } catch {
        return { statusCode: 400 };
      }

      if (typeof reviewUpdate !== 'object') {
        return { statusCode: 400 };
      }

      const updateExpression = [];
      const expressionAttributeNames: Record<string, string> = { '#id': 'id' };
      const expressionAttributeValues: Record<string, NativeAttributeValue> = { ':id': reviewId };

      if (reviewUpdate.date !== undefined) {
        const date = new Date(reviewUpdate.date);
        if (isNaN(date.valueOf())) {
          return { statusCode: 400 };
        } else {
          updateExpression.push('#date = :date');
          expressionAttributeNames['#date'] = 'date';
          expressionAttributeValues[':date'] = date.toISOString().slice(0, 10);
        }
      }

      if (reviewUpdate.restaurant !== undefined) {
        const restaurant = reviewUpdate.restaurant;
        if (typeof restaurant !== 'string') {
          return { statusCode: 400 };
        } else {
          updateExpression.push('#restaurant = :restaurant');
          expressionAttributeNames['#restaurant'] = 'restaurant';
          expressionAttributeValues[':restaurant'] = restaurant;
        }
      }

      if (reviewUpdate.stars !== undefined) {
        const stars = reviewUpdate.stars;
        if (![1, 2, 3, 4, 5].includes(stars)) {
          return { statusCode: 400 };
        } else {
          updateExpression.push('#stars = :stars');
          expressionAttributeNames['#stars'] = 'stars';
          expressionAttributeValues[':stars'] = stars;
        }
      }

      if (updateExpression.length === 0) {
        return { statusCode: 400 };
      }

      const params = {
        TableName: tableName,
        Key: {
          id: reviewId,
        },
        UpdateExpression: `set ${updateExpression.join(', ')}`,
        ConditionExpression: '#id = :id',
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: ReturnValue.ALL_NEW,
      };

      let data = null;
      try {
        data = await dynamoDbDocClient.send(new UpdateCommand(params));
      } catch (error) {
        if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
          return { statusCode: 404 };
        } else {
          console.error(`PATCH "/${reviewId}": DynamoDB Error: ${error}`);
          return { statusCode: 500 };
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify(data.Attributes),
      };
    }
  }

  return { statusCode: 501 };
};
