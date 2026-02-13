import { Type, type Static } from 'typebox';

export const FailureReplyPayload = Type.Object(
  {
    reason: Type.String({ minLength: 1, maxLength: 200, pattern: '^[a-z0-9_.]+$' }),
  },
  { additionalProperties: false },
);
export type FailureReplyPayload = Static<typeof FailureReplyPayload>;
