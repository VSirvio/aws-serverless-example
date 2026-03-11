import {
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';

import {
  DynamoDBDocumentClient,
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
