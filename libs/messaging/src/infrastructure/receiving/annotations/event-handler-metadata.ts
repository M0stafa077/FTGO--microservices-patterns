import type { EventDefinition } from '@ftgo/contracts';
import { DiscoveryService } from '@nestjs/core';
import type { TSchema } from 'typebox';

export const EventHandlerMetadata = DiscoveryService.createDecorator<EventDefinition<TSchema>>();
