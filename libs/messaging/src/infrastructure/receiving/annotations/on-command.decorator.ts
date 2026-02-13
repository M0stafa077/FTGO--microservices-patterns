import type { CommandDefinition } from '@ftgo/contracts';
import type { TSchema } from 'typebox';

import { CommandHandlerMetadata } from './command-handler-metadata.js';
import type { CommandHandlerMethod } from './command-handler-method.js';
import type { HandlerAnnotation } from './handler-annotation.js';

export type OnCommand = <Payload extends TSchema, SuccessPayload extends TSchema>(
  definition: CommandDefinition<Payload, SuccessPayload>,
) => HandlerAnnotation<CommandHandlerMethod<Payload, SuccessPayload>>;
export const OnCommand: OnCommand = CommandHandlerMetadata;
