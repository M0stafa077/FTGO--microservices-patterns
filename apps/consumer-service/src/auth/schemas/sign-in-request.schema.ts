import { Type, type Static } from 'typebox';

export const SignInRequest = Type.Object(
  {
    email: Type.String({ minLength: 1, maxLength: 254 }),
    password: Type.String({ minLength: 1, maxLength: 128 }),
  },
  { additionalProperties: false },
);
export type SignInRequest = Static<typeof SignInRequest>;
