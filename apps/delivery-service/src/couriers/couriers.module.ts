import { Module } from '@nestjs/common';

import { CouriersController } from './couriers.controller.js';
import { Couriers } from './couriers.js';
import { CouriersService } from './couriers.service.js';
import { PostgresCouriers } from './postgres-couriers.js';

@Module({
  controllers: [CouriersController],
  providers: [CouriersService, { provide: Couriers, useClass: PostgresCouriers }],
})
export class CouriersModule {}
