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

import {
  ArgumentError,
  DatabaseError,
} from './errors';

const dynamoDbClient = new DynamoDBClient({});

const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

const tableName = process.env.REVIEWS_TABLE_NAME;

type ReviewCreationData = {
  date: Date;
  restaurant: string;
  stars: 1 | 2 | 3 | 4 | 5;
};

type Review = ReviewCreationData & {
  id: string;
};

type ReviewUpdateData = {
  date?: Date;
  restaurant?: string;
  stars?: 1 | 2 | 3 | 4 | 5;
};

const toReview = (data: Record<string, any>): Review => {
  if (typeof data.id !== 'string' ||
      typeof data.date !== 'string' ||
      isNaN(Date.parse(data.date)) ||
      typeof data.restaurant !== 'string' ||
      !(data.stars in [1, 2, 3, 4, 5])) {
    throw new Error('Could not convert a Record<string, any> object to a Review object');
  }

  return {
    id: data.id,
    date: new Date(data.date),
    restaurant: data.restaurant,
    stars: data.stars,
  };
};

export const getAll = async (): Promise<Review[]> => {
  const params = {
    TableName: tableName,
  };

  let data = null;
  try {
    data = await dynamoDbDocClient.send(new ScanCommand(params));
  } catch (error) {
    throw new DatabaseError(`DynamoDB Error: ${error}`);
  }

  if (data.Items === undefined) {
    throw new DatabaseError('Invalid data received from DynamoDB');
  }

  let result = null;
  try {
    result = data.Items.map(toReview);
  } catch {
    throw new DatabaseError('Invalid data received from DynamoDB');
  }

  return result;
};

export const create = async (review: ReviewCreationData): Promise<Review> => {
  let reviewToCreate = null;

  while (!reviewToCreate) {
    let reviewId = '';

    for (let i = 0; i < length; i++) {
      reviewId += '0123456789ABCDEFGHJKMNPQRSTVWXYZ'[Math.floor(Math.random() * 32)];
    }

    reviewToCreate = {
      id: reviewId,
      date: review.date.toISOString().slice(0, 10),
      restaurant: review.restaurant,
      stars: review.stars,
    };

    const params = {
      TableName: tableName,
      Item: reviewToCreate,
      ConditionExpression: 'attribute_not_exists(id)',
    };

    try {
      await dynamoDbDocClient.send(new PutCommand(params));
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        reviewToCreate = null;
      } else {
        throw new DatabaseError(`DynamoDB Error: ${error}`);
      }
    }
  }

  return { id: reviewToCreate.id, ...review };
};

export const getOne = async (reviewId: string): Promise<Review | null> => {
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
    throw new DatabaseError(`DynamoDB Error: ${error}`);
  }

  if (data.Item === undefined) {
    return null;
  }

  return toReview(data.Item);
};

export const remove = async (reviewId: string): Promise<boolean> => {
  const params = {
    TableName: tableName,
    Key: {
      id: reviewId,
    },
    ConditionExpression: 'attribute_exists(id)',
  };

  try {
    await dynamoDbDocClient.send(new DeleteCommand(params));
  } catch (error) {
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      return false;
    } else {
      throw new DatabaseError(`DynamoDB Error: ${error}`);
    }
  }

  return true;
};

export const update = async (reviewId: string, newData: ReviewUpdateData): Promise<Review | null> => {
  const updateExpression = [];
  const expressionAttributeNames: Record<string, string> = { '#id': 'id' };
  const expressionAttributeValues: Record<string, NativeAttributeValue> = { ':id': reviewId };

  if (newData.date !== undefined) {
    if (isNaN(newData.date.valueOf())) {
      throw new ArgumentError("Invalid date value for 'date' field");
    }

    updateExpression.push('#date = :date');
    expressionAttributeNames['#date'] = 'date';
    expressionAttributeValues[':date'] = newData.date.toISOString().slice(0, 10);
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

  if (updateExpression.length === 0) {
    throw new ArgumentError('Received no data to update');
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
      throw new DatabaseError(`DynamoDB Error: ${error}`);
    }
  }

  if (data.Attributes === undefined) {
    throw new DatabaseError('Invalid data received from DynamoDB');
  }

  return toReview(data.Attributes);
}
