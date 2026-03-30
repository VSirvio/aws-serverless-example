import { RestaurantReview, Stars } from './types.mjs';


export const isUUID = (uuid: unknown): uuid is string => {
  return typeof uuid === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(uuid);
};

export const isValidDate = (date: unknown): date is string => {
  return typeof date === 'string' && !isNaN(new Date(date).valueOf());
};

export const isValidNumberOfStars = (stars: unknown): stars is Stars => {
  return typeof stars === 'number' && [1, 2, 3, 4, 5].includes(stars);
};

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
