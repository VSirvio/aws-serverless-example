import { LambdaFunctionURLEvent } from 'aws-lambda';

import * as reviewsDb from '../database/review.mjs';


export const get = async (_: LambdaFunctionURLEvent) => {
  try {
    const fetchedReviews = await reviewsDb.getAll();

    return {
      statusCode: 200,
      body: JSON.stringify({ data: fetchedReviews }),
    };
  } catch (error) {
    console.error(`GET "/": Database Error: ${error}`);
    return { statusCode: 500 };
  }
};
