import { Type, type Static } from 'typebox';

export const ConsumerCreatedPayload = Type.Object(
  {
    consumerId: Type.String({ format: 'uuid' }),
    name: Type.Object(
      {
        firstName: Type.String({ minLength: 1, maxLength: 100 }),
        lastName: Type.String({ minLength: 1, maxLength: 100 }),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
export type ConsumerCreatedPayload = Static<typeof ConsumerCreatedPayload>;
