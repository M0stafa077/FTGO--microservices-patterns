import { Type, type Static } from 'typebox';

export const AccountCreatedPayload = Type.Object({}, { additionalProperties: false });
export type AccountCreatedPayload = Static<typeof AccountCreatedPayload>;
