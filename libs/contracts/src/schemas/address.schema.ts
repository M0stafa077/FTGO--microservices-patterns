import { Type, type Static } from 'typebox';

export const Address = Type.Object(
  {
    street1: Type.String({ minLength: 1, maxLength: 100 }),
    street2: Type.Optional(Type.String({ maxLength: 100 })),
    city: Type.String({ minLength: 1, maxLength: 100 }),
    state: Type.String({ minLength: 1, maxLength: 100 }),
    zip: Type.String({ minLength: 1, maxLength: 20 }),
  },
  { additionalProperties: false },
);
export type Address = Static<typeof Address>;
