import { Module } from '@nestjs/common';

import { ConsumerCommandsController } from './consumer-commands.controller.js';
import { ConsumerEventMessages } from './consumer-event-messages.js';
import { ConsumersController } from './consumers.controller.js';
import { Consumers } from './consumers.js';
import { ConsumersService } from './consumers.service.js';
import { PostgresConsumers } from './postgres-consumers.js';

@Module({
  controllers: [ConsumersController],
  providers: [
    ConsumersService,
    ConsumerEventMessages,
    ConsumerCommandsController,
    { provide: Consumers, useClass: PostgresConsumers },
  ],
  exports: [ConsumersService],
})
export class ConsumersModule {}
