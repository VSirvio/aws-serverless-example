import {
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';

import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';


const dynamoDbClient = new DynamoDBClient({});
const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

const tableName = process.env.REVIEWS_TABLE_NAME;


export const getAll = async () => {
  const params = {
    TableName: tableName,
  };

  const data = await dynamoDbDocClient.send(new ScanCommand(params));

  return data.Items;
};


export const create = async (review: Record<string, any>) => {
  let finalReviewObject = null;

  while (!finalReviewObject) {
    let reviewId = '';
    for (let i = 0; i < 5; i++) {
      reviewId += '0123456789ABCDEFGHJKMNPQRSTVWXYZ'[Math.floor(Math.random() * 32)];
    }

    finalReviewObject = {
      id: reviewId,
      date: new Date(review.date).toISOString().slice(0, 10),
      restaurant: review.restaurant,
      stars: review.stars,
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
        throw error;
      }
    }
  }

  return finalReviewObject;
};
