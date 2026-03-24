import { LambdaFunctionURLEvent } from 'aws-lambda';

import * as reviewsRequestHandler from './http-request-handlers/review.mjs';


export const handler = async (event: LambdaFunctionURLEvent) => {
  const { path, method } = event.requestContext.http;

  if (path === '/reviews') {
    if (method === 'GET') {
      return reviewsRequestHandler.get(event);
    } else if (method === 'POST') {
      return reviewsRequestHandler.post(event);
    }
  } else if (path.match('^/reviews/[A-Z0-9]{5}$')) {
    if (method === 'GET') {
      return reviewsRequestHandler.getById(event);
    } else if (method === 'DELETE') {
      return reviewsRequestHandler.del(event);
    } else if (method === 'PATCH') {
      return reviewsRequestHandler.patch(event);
    }
  } else if (path === '/') {
    return {
      statusCode: 404,
      body: '{ "error": { "message": "This is the root path and there is nothing here. Try /reviews instead." } }',
    };
  }

  return {
    statusCode: 404,
    body: '{ "error": { "message": "Resource not found" } }',
  };
};
