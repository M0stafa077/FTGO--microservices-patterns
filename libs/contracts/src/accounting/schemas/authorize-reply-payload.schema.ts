import { Type, type Static } from 'typebox';

export const AuthorizeReplyPayload = Type.Object({}, { additionalProperties: false });
export type AuthorizeReplyPayload = Static<typeof AuthorizeReplyPayload>;
