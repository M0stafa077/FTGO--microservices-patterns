import { Type, type Static } from 'typebox';

export const AuthorizationReplyPayload = Type.Object({}, { additionalProperties: false });
export type AuthorizationReplyPayload = Static<typeof AuthorizationReplyPayload>;
