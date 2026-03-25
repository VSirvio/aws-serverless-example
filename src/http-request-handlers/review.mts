import { LambdaFunctionURLEvent, LambdaFunctionURLResult } from 'aws-lambda';

import * as reviewsDb from '../database/review.mjs';
import { RestaurantReviewUpdate } from '../types.mjs';
import { isValidDate, isValidNumberOfStars } from '../utils.mjs';


export const get = async (_: LambdaFunctionURLEvent): Promise<LambdaFunctionURLResult> => {
  try {
    const fetchedReviews = await reviewsDb.getAll();

    return {
      statusCode: 200,
      body: JSON.stringify({ data: fetchedReviews }),
    };
  } catch (error) {
    console.error(`GET "/": Database Error: ${error}`);

    return {
      statusCode: 500,
      body: '{ "error": { "message": "Internal server error" } }',
    };
  }
};


export const post = async (event: LambdaFunctionURLEvent): Promise<LambdaFunctionURLResult> => {
  if (typeof event.body !== 'string') {
    return {
      statusCode: 400,
      body: '{ "error": { "message": "Request body missing" } }',
    };
  }

  let newReview = null;
  try {
    newReview = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: '{ "error": { "message": "Request body not valid JSON" } }',
    };
  }

  if (typeof newReview !== 'object') {
    return {
      statusCode: 400,
      body: '{ "error": { "message": "Request body not a JSON object" } }',
    };
  }

  if (typeof newReview.restaurant !== 'string') {
    return {
      statusCode: 400,
      body: '{ "error": { "message": "String value expected for \'restaurant\' field" } }',
    };
  }

  if (!isValidNumberOfStars(newReview.stars)) {
    return {
      statusCode: 400,
      body: '{ "error": { "message": "Integer between 1-5 expected for \'stars\' field" } }',
    };
  }

  if (!isValidDate(newReview.date)) {
    return {
      statusCode: 400,
      body: '{ "error": { "message": "Invalid date value for \'date\' field" } }',
    };
  }

  let createdReview = null;
  try {
    const reviewData = {
      date: new Date(newReview.date),
      restaurant: newReview.restaurant,
      stars: newReview.stars,
    };

    createdReview = await reviewsDb.create(reviewData);
  } catch (error) {
    console.error(`POST "/": Database Error: ${error}`);

    return {
      statusCode: 500,
      body: '{ "error": { "message": "Internal server error" } }',
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ data: createdReview }),
  };
};


export const getById = async (event: LambdaFunctionURLEvent): Promise<LambdaFunctionURLResult> => {
  const reviewId = event.requestContext.http.path.substring(9);

  let fetchedReview = null;

  try {
    fetchedReview = await reviewsDb.getById(reviewId);
  } catch (error) {
    console.error(`GET "/${reviewId}": Database Error: ${error}`);

    return {
      statusCode: 500,
      body: '{ "error": { "message": "Internal server error" } }',
    };
  }

  if (!fetchedReview) {
    return {
      statusCode: 404,
      body: '{ "error": { "message": "Review not found" } }',
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ data: fetchedReview }),
  };
};


export const del = async (event: LambdaFunctionURLEvent): Promise<LambdaFunctionURLResult> => {
  const reviewId = event.requestContext.http.path.substring(9);

  let deletedReview = null;
  try {
    deletedReview = await reviewsDb.remove(reviewId);
  } catch (error) {
    console.error(`DELETE "/${reviewId}": Database Error: ${error}`);

    return {
      statusCode: 500,
      body: '{ "error": { "message": "Internal server error" } }',
    };
  }

  if (deletedReview === null) {
    return {
      statusCode: 404,
      body: '{ "error": { "message": "Review not found" } }',
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ data: deletedReview }),
  };
};


export const patch = async (event: LambdaFunctionURLEvent): Promise<LambdaFunctionURLResult> => {
  const reviewId = event.requestContext.http.path.substring(9);

  if (typeof event.body !== 'string') {
    return {
      statusCode: 400,
      body: '{ "error": { "message": "Request body missing" } }',
    };
  }

  let reviewUpdate = null;
  try {
    reviewUpdate = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: '{ "error": { "message": "Request body not valid JSON" } }',
    };
  }

  if (typeof reviewUpdate !== 'object') {
    return {
      statusCode: 400 ,
      body: '{ "error": { "message": "Request body not a JSON object" } }',
    };
  }

  const finalUpdateObject: RestaurantReviewUpdate = {};

  if (reviewUpdate.date !== undefined) {
    if (isValidDate(reviewUpdate.date)) {
      finalUpdateObject.date = new Date(reviewUpdate.date);
    } else {
      return {
        statusCode: 400,
        body: '{ "error": { "message": "Invalid date value for \'date\' field" } }',
      };
    }
  }

  if (reviewUpdate.restaurant !== undefined) {
    if (typeof reviewUpdate.restaurant === 'string') {
      finalUpdateObject.restaurant = reviewUpdate.restaurant;
    } else {
      return {
        statusCode: 400,
        body: '{ "error": { "message": "String value expected for \'restaurant\' field" } }',
      };
    }
  }

  if (reviewUpdate.stars !== undefined) {
    if (isValidNumberOfStars(reviewUpdate.stars)) {
      finalUpdateObject.stars = reviewUpdate.stars;
    } else {
      return {
        statusCode: 400,
        body: '{ "error": { "message": "Integer between 1-5 expected for \'stars\' field" } }',
      };
    }
  }

  if (Object.keys(finalUpdateObject).length === 0) {
    return {
      statusCode: 400,
      body: '{ "error": { "message": "Request did not include any data to update" } }',
    };
  }

  let updatedReview = null;
  try {
    updatedReview = await reviewsDb.update(reviewId, finalUpdateObject);
  } catch (error) {
    console.error(`PATCH "/${reviewId}": Database Error: ${error}`);

    return {
      statusCode: 500,
      body: '{ "error": { "message": "Internal server error" } }',
    };
  }

  if (!updatedReview) {
    return {
      statusCode: 404,
      body: '{ "error": { "message": "Review not found" } }',
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ data: updatedReview }),
  };
};
