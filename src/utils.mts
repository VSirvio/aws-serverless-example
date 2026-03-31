import { RestaurantReview, Stars } from './types.mjs';


/** Checks if the argument "uuid" is a string that contains a UUID. */
export const isUUID = (uuid: unknown): uuid is string => {
  return typeof uuid === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(uuid);
};

/** Checks if the argument "date" is a string that can be used to construct a Date object. */
export const isValidDate = (date: unknown): date is string => {
  return typeof date === 'string' && !isNaN(new Date(date).valueOf());
};

/** Checks if the argument "stars" is an integer between 1 and 5 (inclusive). */
export const isValidNumberOfStars = (stars: unknown): stars is Stars => {
  return typeof stars === 'number' && [1, 2, 3, 4, 5].includes(stars);
};

/**
 * Checks that the argument "review" has exactly the fields required for a
 * RestaurantReview object with valid values and creates a RestaurantReview
 * object based on it.
 */
export const asRestaurantReview = (review: Record<string, any>): RestaurantReview => {
  if (typeof review.id !== 'string' ||
      !isValidDate(review.date) ||
      typeof review.restaurant !== 'string' ||
      !isValidNumberOfStars(review.stars)) {
    throw Error('Converting to RestaurantReview failed: Invalid data');
  }

  return {
    id: review.id,
    date: new Date(review.date),
    restaurant: review.restaurant,
    stars: review.stars,
  };
};
