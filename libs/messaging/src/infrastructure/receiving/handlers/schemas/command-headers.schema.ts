import { Type, type Static } from 'typebox';

export const CommandHeaders = Type.Object(
  {
    messageId: Type.String({ format: 'uuid' }),
    type: Type.String({ minLength: 1, maxLength: 100 }),
    timestamp: Type.String({ format: 'date-time' }),
    correlationId: Type.String({ pattern: '^[A-Za-z0-9._-]{1,128}$' }),
    traceparent: Type.Optional(
      Type.String({ pattern: '^[0-9a-f]{2}-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$' }),
    ),
    tracestate: Type.Optional(Type.String({ maxLength: 512 })),
    replyTo: Type.String({ pattern: '^[A-Za-z0-9._-]{1,249}$' }),
    sagaType: Type.String({ minLength: 1, maxLength: 100 }),
    sagaId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
export type CommandHeaders = Static<typeof CommandHeaders>;
