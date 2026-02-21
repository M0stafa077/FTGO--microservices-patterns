import { Type, type Static } from 'typebox';

export const TicketIdParameter = Type.String({ format: 'uuid' });
export type TicketIdParameter = Static<typeof TicketIdParameter>;
