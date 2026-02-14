import { Type, type Static } from 'typebox';

export const RestaurantIdParameter = Type.String({ format: 'uuid' });
export type RestaurantIdParameter = Static<typeof RestaurantIdParameter>;
