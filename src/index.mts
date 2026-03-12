import { LambdaFunctionURLEvent } from 'aws-lambda';

import * as reviewsRequestHandler from './http-request-handlers/review.mjs';


export const handler = async (event: LambdaFunctionURLEvent) => {
  const path = event.requestContext.http.path;
  const method = event.requestContext.http.method;

  if (path === '/') {
    if (method === 'GET') {
      const httpResponse = reviewsRequestHandler.get(event);
      return httpResponse;
    } else if (method === 'POST') {
      const httpResponse = reviewsRequestHandler.post(event);
      return httpResponse;
    }
  } else if (path.match('^/[A-Z0-9]{5}$')) {
    if (method === 'GET') {
      const httpResponse = reviewsRequestHandler.getById(event);
      return httpResponse;
    } else if (method === 'DELETE') {
      const httpResponse = reviewsRequestHandler.del(event);
      return httpResponse;
    } else if (method === 'PATCH') {
      const httpResponse = reviewsRequestHandler.patch(event);
      return httpResponse;
    }
  }

  return { statusCode: 404 };
};
