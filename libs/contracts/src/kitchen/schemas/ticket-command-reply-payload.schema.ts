import { Type, type Static } from 'typebox';

export const TicketCommandReplyPayload = Type.Object({}, { additionalProperties: false });
export type TicketCommandReplyPayload = Static<typeof TicketCommandReplyPayload>;
