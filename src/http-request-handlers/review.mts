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


export const post = async (event: LambdaFunctionURLEvent) => {
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

  if (![1, 2, 3, 4, 5].includes(newReview.stars)) {
    return {
      statusCode: 400,
      body: '{ "error": { "message": "Integer between 1-5 expected for \'stars\' field" } }',
    };
  }

  const date = new Date(newReview.date);
  if (isNaN(date.valueOf())) {
    return {
      statusCode: 400,
      body: '{ "error": { "message": "Invalid date value for \'date\' field" } }',
    };
  }

  let createdReview = null;
  try {
    const reviewData = {
      date: date.toISOString().slice(0, 10),
      restaurant: newReview.restaurant,
      stars: newReview.stars,
    };

    createdReview = await reviewsDb.create(reviewData);
  } catch (error) {
    console.error(`POST "/": Database Error: ${error}`);
    return { statusCode: 500 };
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ data: createdReview }),
  };
};


export const getById = async (event: LambdaFunctionURLEvent) => {
  const reviewId = event.requestContext.http.path.substring(9);

  let fetchedReview = null;

  try {
    fetchedReview = await reviewsDb.getById(reviewId);
  } catch (error) {
    console.error(`GET "/${reviewId}": Database Error: ${error}`);
    return { statusCode: 500 };
  }

  if (!fetchedReview) {
    return { statusCode: 404 };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ data: fetchedReview }),
  };
};


export const del = async (event: LambdaFunctionURLEvent) => {
  const reviewId = event.requestContext.http.path.substring(9);

  let deletionSuccessful = true;

  try {
    deletionSuccessful = await reviewsDb.remove(reviewId);
  } catch (error) {
    console.error(`DELETE "/${reviewId}": Database Error: ${error}`);
    return { statusCode: 500 };
  }

  if (!deletionSuccessful) {
    return { statusCode: 404 };
  }

  return { statusCode: 204 };
};


export const patch = async (event: LambdaFunctionURLEvent) => {
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

  let updateIsEmpty = true;

  if (reviewUpdate.date !== undefined) {
    updateIsEmpty = false;

    if (isNaN(new Date(reviewUpdate.date).valueOf())) {
      return {
        statusCode: 400,
        body: '{ "error": { "message": "Invalid date value for \'date\' field" } }',
      };
    }
  }

  if (reviewUpdate.restaurant !== undefined) {
    updateIsEmpty = false;

    if (typeof reviewUpdate.restaurant !== 'string') {
      return {
        statusCode: 400,
        body: '{ "error": { "message": "String value expected for \'restaurant\' field" } }',
      };
    }
  }

  if (reviewUpdate.stars !== undefined) {
    updateIsEmpty = false;

    if (![1, 2, 3, 4, 5].includes(reviewUpdate.stars)) {
      return {
        statusCode: 400,
        body: '{ "error": { "message": "Integer between 1-5 expected for \'stars\' field" } }',
      };
    }
  }

  if (updateIsEmpty) {
    return {
      statusCode: 400,
      body: '{ "error": { "message": "Request did not include any data to update" } }',
    };
  }

  let updatedReview = null;
  try {
    updatedReview = await reviewsDb.update(reviewId, reviewUpdate);
  } catch (error) {
    console.error(`PATCH "/${reviewId}": Database Error: ${error}`);
    return { statusCode: 500 };
  }

  if (!updatedReview) {
    return { statusCode: 404 };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ data: updatedReview }),
  };
};
