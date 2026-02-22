import { SchemaValidationPipe } from '@ftgo/common/infrastructure';
import { Controller, Get, Headers, Param } from '@nestjs/common';

import { OrderDetailsResponse } from './dto/order-details-response.dto.js';
import { OrderId } from './entities/order-id.js';
import { OrderDetailsService } from './order-details.service.js';
import { OrderIdParameter } from './schemas/order-id-parameter.schema.js';

@Controller('orders')
export class OrderDetailsController {
  public constructor(private readonly orderDetailsService: OrderDetailsService) {}

  @Get(':orderId')
  public async get(
    @Param('orderId', new SchemaValidationPipe(OrderIdParameter)) orderId: string,
    @Headers('authorization') authorization: string,
  ): Promise<OrderDetailsResponse> {
    return new OrderDetailsResponse(
      await this.orderDetailsService.getOrderDetails(OrderId.of(orderId), authorization),
    );
  }
}
