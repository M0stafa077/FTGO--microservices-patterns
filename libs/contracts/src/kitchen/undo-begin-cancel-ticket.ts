import { CommandDefinition } from '../command-definition.js';
import { ReplyDefinition } from '../reply-definition.js';

import { KITCHEN_SERVICE_COMMANDS } from './kitchen.constants.js';
import { TicketCommandPayload } from './schemas/ticket-command-payload.schema.js';
import { TicketCommandReplyPayload } from './schemas/ticket-command-reply-payload.schema.js';

export const UndoBeginCancelTicket = new CommandDefinition(
  'UndoBeginCancelTicket',
  KITCHEN_SERVICE_COMMANDS,
  TicketCommandPayload,
  new ReplyDefinition('UndoBeginCancelTicketReply', TicketCommandReplyPayload),
);
