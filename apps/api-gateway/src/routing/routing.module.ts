import { Module, type DynamicModule } from '@nestjs/common';

import { ServicesConfig } from '../config/services.config.js';

import { AccountsController } from './accounts.controller.js';
import { AuthController } from './auth.controller.js';
import { ConsumersController } from './consumers.controller.js';
import { CouriersController } from './couriers.controller.js';
import { DeliveriesController } from './deliveries.controller.js';
import { FetchForwarding } from './fetch-forwarding.js';
import { Forwarding } from './forwarding.js';
import { OrdersController } from './orders.controller.js';
import { RestaurantsController } from './restaurants.controller.js';
import { TicketsController } from './tickets.controller.js';

@Module({})
export class RoutingModule {
  public static with(services: ServicesConfig): DynamicModule {
    return {
      module: RoutingModule,
      controllers: [
        AuthController,
        ConsumersController,
        RestaurantsController,
        OrdersController,
        TicketsController,
        CouriersController,
        DeliveriesController,
        AccountsController,
      ],
      providers: [
        { provide: ServicesConfig, useValue: services },
        { provide: Forwarding, useClass: FetchForwarding },
      ],
    };
  }
}
