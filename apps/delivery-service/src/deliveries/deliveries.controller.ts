import { Caller, CurrentCaller, SchemaValidationPipe } from '@ftgo/common/infrastructure';
import { Controller, Get, Param } from '@nestjs/common';

import { DeliveriesService } from './deliveries.service.js';
import { DeliveryResponse } from './dto/delivery-response.dto.js';
import { ConsumerId } from './entities/consumer-id.js';
import { DeliveryId } from './entities/delivery-id.js';
import { DeliveryIdParameter } from './schemas/delivery-id-parameter.schema.js';

@Controller('deliveries')
export class DeliveriesController {
  public constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get(':deliveryId')
  public async get(
    @CurrentCaller() caller: Caller,
    @Param('deliveryId', new SchemaValidationPipe(DeliveryIdParameter)) deliveryId: string,
  ): Promise<DeliveryResponse> {
    return new DeliveryResponse(
      await this.deliveriesService.getDelivery(
        DeliveryId.of(deliveryId),
        ConsumerId.of(caller.accountId.toString()),
        caller.role,
      ),
    );
  }
}
