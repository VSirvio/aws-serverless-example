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
      } catch {
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

      let reviewId = '';
      for (let i = 0; i < 5; i++) {
        reviewId += '0123456789ABCDEFGHJKMNPQRSTVWXYZ'[Math.floor(Math.random() * 32)];
      }

      const finalReviewObject = {
        id: reviewId,
        date: date.toISOString().slice(0, 10),
        restaurant: newReview.restaurant,
        stars: newReview.stars,
      };

      const params = {
        TableName: tableName,
        Item: finalReviewObject,
      };

      try {
        await dynamoDbDocClient.send(new PutCommand(params));
      } catch {
        return { statusCode: 500 };
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
      } catch {
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
      } catch {
        return { statusCode: 500 };
      }

      return { statusCode: 204 };
    }
  }

  return { statusCode: 501 };
};
