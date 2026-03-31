/** A number of stars from 1 to 5 for grading a restaurant. */
export type Stars = 1 | 2 | 3 | 4 | 5;

export interface RestaurantReview {
  id: string;
  date: Date;
  restaurant: string;
  stars: Stars;
}

/** Contains the data needed for adding a new restaurant review. */
export type NewRestaurantReview = Omit<RestaurantReview, 'id'>;

/** Contains the data needed for editing some or all of the fields of a restaurant review. */
export type RestaurantReviewUpdate = Partial<NewRestaurantReview>;
