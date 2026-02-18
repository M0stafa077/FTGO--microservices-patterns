import { CommandDefinition } from '../command-definition.js';
import { ReplyDefinition } from '../reply-definition.js';

import { KITCHEN_SERVICE_COMMANDS } from './kitchen.constants.js';
import { CreateTicketPayload } from './schemas/create-ticket-payload.schema.js';
import { CreateTicketReplyPayload } from './schemas/create-ticket-reply-payload.schema.js';

export const CreateTicket = new CommandDefinition(
  'CreateTicket',
  KITCHEN_SERVICE_COMMANDS,
  CreateTicketPayload,
  new ReplyDefinition('CreateTicketReply', CreateTicketReplyPayload),
);
