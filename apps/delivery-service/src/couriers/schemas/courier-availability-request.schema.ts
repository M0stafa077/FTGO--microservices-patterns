import { Type, type Static } from 'typebox';

export const CourierAvailabilityRequest = Type.Object(
  {
    isAvailable: Type.Boolean(),
  },
  { additionalProperties: false },
);
export type CourierAvailabilityRequest = Static<typeof CourierAvailabilityRequest>;
