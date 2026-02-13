import type { Static, TSchema } from 'typebox';

import type { IncomingMessage } from '../../../envelope/incoming-message.js';
import type { Reply } from '../../../replies/reply.js';

export type CommandHandlerMethod<Payload extends TSchema, SuccessPayload extends TSchema> = (
  message: IncomingMessage<Static<Payload>>,
) => Promise<Reply<Static<SuccessPayload>>>;
