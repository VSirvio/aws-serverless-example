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

import { randomUUID } from 'node:crypto';

import {
  NewRestaurantReview,
  RestaurantReviewUpdate,
} from '../types.mjs';

import { asRestaurantReview } from '../utils.mjs';


const dynamoDbClient = new DynamoDBClient({});
const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

const tableName = process.env.REVIEWS_TABLE_NAME;


export const getAll = async () => {
  const params = {
    TableName: tableName,
  };

  const data = await dynamoDbDocClient.send(new ScanCommand(params));

  return data.Items!.map(item => asRestaurantReview(item));
};


export const create = async (review: NewRestaurantReview) => {
  let finalReviewObject = null;

  while (!finalReviewObject) {
    finalReviewObject = {
      id: randomUUID(),
      date: review.date.toISOString(),
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

  return asRestaurantReview(finalReviewObject);
};


export const getById = async (reviewId: string) => {
  const params = {
    TableName: tableName,
    Key: {
      id: reviewId,
    },
  };

  const data = await dynamoDbDocClient.send(new GetCommand(params));

  if (!data.Item) {
    return null;
  }

  return asRestaurantReview(data.Item);
};


export const remove = async (reviewId: string) => {
  const params = {
    TableName: tableName,
    Key: {
      id: reviewId,
    },
    ConditionExpression: 'attribute_exists(id)',
    ReturnValues: ReturnValue.ALL_OLD,
  };

  let data = null;
  try {
    data = await dynamoDbDocClient.send(new DeleteCommand(params));
  } catch (error) {
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      return null;
    } else {
      throw error;
    }
  }

  return asRestaurantReview(data.Attributes!);
};


export const update = async (reviewId: string, newData: RestaurantReviewUpdate) => {
  const updateExpression = [];
  const expressionAttributeNames: Record<string, string> = { '#id': 'id' };
  const expressionAttributeValues: Record<string, NativeAttributeValue> = { ':id': reviewId };

  if (newData.date !== undefined) {
    updateExpression.push('#date = :date');
    expressionAttributeNames['#date'] = 'date';
    expressionAttributeValues[':date'] = newData.date.toISOString();
  }

  if (newData.restaurant !== undefined) {
    updateExpression.push('#restaurant = :restaurant');
    expressionAttributeNames['#restaurant'] = 'restaurant';
    expressionAttributeValues[':restaurant'] = newData.restaurant;
  }

  if (newData.stars !== undefined) {
    updateExpression.push('#stars = :stars');
    expressionAttributeNames['#stars'] = 'stars';
    expressionAttributeValues[':stars'] = newData.stars;
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
      return null;
    } else {
      throw error;
    }
  }

  return asRestaurantReview(data.Attributes!);
};
