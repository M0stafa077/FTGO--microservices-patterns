import { Type, type Static } from 'typebox';

export const RegisterRequest = Type.Object(
  {
    email: Type.String({ format: 'email', maxLength: 254 }),
    password: Type.String({ minLength: 1, maxLength: 128 }),
    firstName: Type.String({ minLength: 1, maxLength: 100 }),
    lastName: Type.String({ minLength: 1, maxLength: 100 }),
    phoneNumber: Type.Optional(Type.String({ minLength: 1, maxLength: 20 })),
  },
  { additionalProperties: false },
);
export type RegisterRequest = Static<typeof RegisterRequest>;
