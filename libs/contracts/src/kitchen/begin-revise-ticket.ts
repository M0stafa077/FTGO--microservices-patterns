import { CommandDefinition } from '../command-definition.js';
import { ReplyDefinition } from '../reply-definition.js';

import { KITCHEN_SERVICE_COMMANDS } from './kitchen.constants.js';
import { TicketCommandReplyPayload } from './schemas/ticket-command-reply-payload.schema.js';
import { TicketRevisionPayload } from './schemas/ticket-revision-payload.schema.js';

export const BeginReviseTicket = new CommandDefinition(
  'BeginReviseTicket',
  KITCHEN_SERVICE_COMMANDS,
  TicketRevisionPayload,
  new ReplyDefinition('BeginReviseTicketReply', TicketCommandReplyPayload),
);
