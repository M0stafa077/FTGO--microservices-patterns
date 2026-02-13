import { Type, type Static } from 'typebox';

export const EventHeaders = Type.Object(
  {
    messageId: Type.String({ format: 'uuid' }),
    type: Type.String({ minLength: 1, maxLength: 100 }),
    timestamp: Type.String({ format: 'date-time' }),
    correlationId: Type.String({ pattern: '^[A-Za-z0-9._-]{1,128}$' }),
    aggregateType: Type.String({ minLength: 1, maxLength: 100 }),
    aggregateId: Type.String({ minLength: 1, maxLength: 100 }),
  },
  { additionalProperties: false },
);
export type EventHeaders = Static<typeof EventHeaders>;
