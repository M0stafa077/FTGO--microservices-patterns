import { Type, type Static } from 'typebox';

export const UpdateProfileRequest = Type.Object(
  {
    firstName: Type.String({ minLength: 1, maxLength: 100 }),
    lastName: Type.String({ minLength: 1, maxLength: 100 }),
    phoneNumber: Type.Optional(Type.String({ minLength: 1, maxLength: 20 })),
  },
  { additionalProperties: false },
);
export type UpdateProfileRequest = Static<typeof UpdateProfileRequest>;
