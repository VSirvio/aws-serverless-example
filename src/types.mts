export type Stars = 1 | 2 | 3 | 4 | 5;

export interface RestaurantReview {
  id: string;
  date: Date;
  restaurant: string;
  stars: Stars;
}

export type NewRestaurantReview = Omit<RestaurantReview, 'id'>;
export type RestaurantReviewUpdate = Partial<NewRestaurantReview>;
