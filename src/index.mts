import { LambdaFunctionURLEvent } from 'aws-lambda';

export const handler = async (event: LambdaFunctionURLEvent) => {
  return {
    statusCode: 200,
    body: JSON.stringify(event.requestContext.time),
  };
};
