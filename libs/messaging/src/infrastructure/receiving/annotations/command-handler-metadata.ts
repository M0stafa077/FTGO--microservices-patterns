import type { CommandDefinition } from '@ftgo/contracts';
import { DiscoveryService } from '@nestjs/core';
import type { TSchema } from 'typebox';

export const CommandHandlerMetadata =
  DiscoveryService.createDecorator<CommandDefinition<TSchema, TSchema>>();
