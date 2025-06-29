import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { LambdaFunctionURLEvent } from 'aws-lambda';

const dynamoDbClient = new DynamoDBClient({});

const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const handler = async (event: LambdaFunctionURLEvent) => {
  const path = event.requestContext.http.path;
  const method = event.requestContext.http.method;

  if (path === '/') {
    if (method === 'GET') {
      const params = {
        TableName: 'restaurant-reviews',
      };

      const data = await dynamoDbDocClient.send(new ScanCommand(params));

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

      let reviewId = '';
      for (let i = 0; i < 5; i++) {
        reviewId += '0123456789ABCDEFGHJKMNPQRSTVWXYZ'[Math.floor(Math.random() * 32)];
      }

      const params = {
        TableName: "restaurant-reviews",
        Item: {
          id: reviewId,
          date: new Date().toISOString().split('T')[0],
          restaurant: newReview.restaurant,
          stars: newReview.stars,
        },
      };

      await dynamoDbDocClient.send(new PutCommand(params));

      return { statusCode: 201 };
    }
  } else {
    const reviewId = path.substring(1);

    if (method === 'GET') {
      const params = {
        TableName: "restaurant-reviews",
        Key: {
          id: reviewId,
        },
      };

      const data = await dynamoDbDocClient.send(new GetCommand(params));

      if (!('Item' in data)) {
        return { statusCode: 404 };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(data.Item),
      };
    } else if (method === 'DELETE') {
      const params = {
        TableName: "restaurant-reviews",
        Key: {
          id: reviewId,
        },
      };

      await dynamoDbDocClient.send(new DeleteCommand(params));

      return { statusCode: 204 };
    }
  }

  return { statusCode: 501 };
};
