import { Type, type Static } from 'typebox';

export const RefreshRequest = Type.Object(
  {
    refreshToken: Type.String({ minLength: 1, maxLength: 256 }),
  },
  { additionalProperties: false },
);
export type RefreshRequest = Static<typeof RefreshRequest>;
