import { Clock } from '@ftgo/common';
import { Module, type DynamicModule } from '@nestjs/common';

import { ServicesConfig } from '../config/services.config.js';

import { Authorizations } from './authorizations.js';
import { CircuitBreakingServiceCalls } from './circuit-breaking-service-calls.js';
import { Deliveries } from './deliveries.js';
import { FetchServiceCalls } from './fetch-service-calls.js';
import { HttpAuthorizations } from './http-authorizations.js';
import { HttpDeliveries } from './http-deliveries.js';
import { HttpOrders } from './http-orders.js';
import { HttpTickets } from './http-tickets.js';
import { OrderDetailsController } from './order-details.controller.js';
import { OrderDetailsService } from './order-details.service.js';
import { Orders } from './orders.js';
import { ServiceCalls } from './service-calls.js';
import { Tickets } from './tickets.js';

@Module({})
export class CompositionModule {
  public static with(services: ServicesConfig): DynamicModule {
    return {
      module: CompositionModule,
      controllers: [OrderDetailsController],
      providers: [
        { provide: ServicesConfig, useValue: services },
        FetchServiceCalls,
        {
          provide: ServiceCalls,
          useFactory: (inner: FetchServiceCalls, clock: Clock): ServiceCalls =>
            new CircuitBreakingServiceCalls(inner, clock),
          inject: [FetchServiceCalls, Clock],
        },
        { provide: Orders, useClass: HttpOrders },
        { provide: Tickets, useClass: HttpTickets },
        { provide: Deliveries, useClass: HttpDeliveries },
        { provide: Authorizations, useClass: HttpAuthorizations },
        OrderDetailsService,
      ],
    };
  }
}
