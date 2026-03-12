import { LambdaFunctionURLEvent } from 'aws-lambda';

import * as reviewsRequestHandler from './http-request-handlers/review.mjs';


export const handler = async (event: LambdaFunctionURLEvent) => {
  const path = event.requestContext.http.path;
  const method = event.requestContext.http.method;

  if (path === '/') {
    if (method === 'GET') {
      return reviewsRequestHandler.get(event);
    } else if (method === 'POST') {
      return reviewsRequestHandler.post(event);
    }
  } else if (path.match('^/[A-Z0-9]{5}$')) {
    if (method === 'GET') {
      return reviewsRequestHandler.getById(event);
    } else if (method === 'DELETE') {
      return reviewsRequestHandler.del(event);
    } else if (method === 'PATCH') {
      return reviewsRequestHandler.patch(event);
    }
  }

  return { statusCode: 404 };
};
