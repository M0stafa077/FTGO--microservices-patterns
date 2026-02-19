import { CommandDefinition } from '../command-definition.js';
import { ReplyDefinition } from '../reply-definition.js';

import { ACCOUNTING_SERVICE_COMMANDS } from './accounting.constants.js';
import { AuthorizePayload } from './schemas/authorize-payload.schema.js';
import { AuthorizeReplyPayload } from './schemas/authorize-reply-payload.schema.js';

export const Authorize = new CommandDefinition(
  'Authorize',
  ACCOUNTING_SERVICE_COMMANDS,
  AuthorizePayload,
  new ReplyDefinition('AuthorizeReply', AuthorizeReplyPayload),
);
