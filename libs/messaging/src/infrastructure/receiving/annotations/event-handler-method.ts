import type { Static, TSchema } from 'typebox';

import type { IncomingMessage } from '../../../envelope/incoming-message.js';

export type EventHandlerMethod<Payload extends TSchema> = (
  message: IncomingMessage<Static<Payload>>,
) => Promise<void>;
