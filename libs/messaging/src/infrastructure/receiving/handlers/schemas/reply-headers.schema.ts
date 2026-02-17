import { Type, type Static } from 'typebox';

import { ReplyOutcome } from '../../../../replies/reply-outcome.js';

export const ReplyHeaders = Type.Object(
  {
    messageId: Type.String({ format: 'uuid' }),
    type: Type.String({ minLength: 1, maxLength: 100 }),
    timestamp: Type.String({ format: 'date-time' }),
    correlationId: Type.String({ pattern: '^[A-Za-z0-9._-]{1,128}$' }),
    sagaType: Type.String({ minLength: 1, maxLength: 100 }),
    sagaId: Type.String({ format: 'uuid' }),
    inReplyTo: Type.String({ format: 'uuid' }),
    outcome: Type.Enum(ReplyOutcome),
  },
  { additionalProperties: false },
);
export type ReplyHeaders = Static<typeof ReplyHeaders>;
