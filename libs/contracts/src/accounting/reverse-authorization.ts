import { CommandDefinition } from '../command-definition.js';
import { ReplyDefinition } from '../reply-definition.js';

import { ACCOUNTING_SERVICE_COMMANDS } from './accounting.constants.js';
import { AuthorizationPayload } from './schemas/authorization-payload.schema.js';
import { AuthorizationReplyPayload } from './schemas/authorization-reply-payload.schema.js';

export const ReverseAuthorization = new CommandDefinition(
  'ReverseAuthorization',
  ACCOUNTING_SERVICE_COMMANDS,
  AuthorizationPayload,
  new ReplyDefinition('ReverseAuthorizationReply', AuthorizationReplyPayload),
);
