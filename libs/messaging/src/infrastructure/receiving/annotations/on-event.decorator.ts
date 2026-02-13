import type { EventDefinition } from '@ftgo/contracts';
import type { TSchema } from 'typebox';

import { EventHandlerMetadata } from './event-handler-metadata.js';
import type { EventHandlerMethod } from './event-handler-method.js';
import type { HandlerAnnotation } from './handler-annotation.js';

export type OnEvent = <Payload extends TSchema>(
  definition: EventDefinition<Payload>,
) => HandlerAnnotation<EventHandlerMethod<Payload>>;
export const OnEvent: OnEvent = EventHandlerMetadata;
