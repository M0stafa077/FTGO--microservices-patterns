import { Module } from '@nestjs/common';

import { ConsumersController } from './consumers.controller.js';
import { Consumers } from './consumers.js';
import { ConsumersService } from './consumers.service.js';
import { PostgresConsumers } from './postgres-consumers.js';

@Module({
  controllers: [ConsumersController],
  providers: [ConsumersService, { provide: Consumers, useClass: PostgresConsumers }],
  exports: [Consumers],
})
export class ConsumersModule {}
