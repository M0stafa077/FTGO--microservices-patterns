import { Address, RestaurantMenu } from '@ftgo/contracts';
import { Type, type Static } from 'typebox';

export const OnboardRestaurantRequest = Type.Object(
  {
    name: Type.String({ minLength: 1, maxLength: 100 }),
    address: Address,
    menu: RestaurantMenu,
  },
  { additionalProperties: false },
);
export type OnboardRestaurantRequest = Static<typeof OnboardRestaurantRequest>;
