import { Address, Quantity } from '@ftgo/common';
import { Caller, CurrentCaller, SchemaValidationPipe } from '@ftgo/common/infrastructure';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Res } from '@nestjs/common';
import type { Response } from 'express';

import { MenuItemId } from '../restaurants/entities/menu-item-id.js';
import { RestaurantId } from '../restaurants/entities/restaurant-id.js';

import { OrderResponse } from './dto/order-response.dto.js';
import { ConsumerId } from './entities/consumer-id.js';
import { DeliveryInformation } from './entities/delivery-information.js';
import { OrderId } from './entities/order-id.js';
import { RequestedLineItem } from './entities/requested-line-item.js';
import { OrdersService } from './orders.service.js';
import type { LineItemRequest } from './schemas/line-item-request.schema.js';
import { OrderIdParameter } from './schemas/order-id-parameter.schema.js';
import { PlaceOrderRequest } from './schemas/place-order-request.schema.js';
import { ReviseOrderRequest } from './schemas/revise-order-request.schema.js';

@Controller('orders')
export class OrdersController {
  public constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async placeOrder(
    @CurrentCaller() caller: Caller,
    @Body(new SchemaValidationPipe(PlaceOrderRequest)) body: PlaceOrderRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<OrderResponse> {
    const order = await this.ordersService.placeOrder(
      ConsumerId.of(caller.accountId.toString()),
      RestaurantId.of(body.restaurantId),
      this.requestedLineItemsOf(body.lineItems),
      DeliveryInformation.of(Address.of(body.deliveryAddress), new Date(body.deliveryTime)),
    );
    response.location(`/orders/${order.id.toString()}`);
    return new OrderResponse(order);
  }

  @Get(':orderId')
  public async get(
    @CurrentCaller() caller: Caller,
    @Param('orderId', new SchemaValidationPipe(OrderIdParameter)) orderId: string,
  ): Promise<OrderResponse> {
    return new OrderResponse(
      await this.ordersService.getOrder(
        OrderId.of(orderId),
        ConsumerId.of(caller.accountId.toString()),
        caller.role,
      ),
    );
  }

  @Post(':orderId/cancel')
  @HttpCode(HttpStatus.OK)
  public async cancel(
    @CurrentCaller() caller: Caller,
    @Param('orderId', new SchemaValidationPipe(OrderIdParameter)) orderId: string,
  ): Promise<OrderResponse> {
    return new OrderResponse(
      await this.ordersService.cancelOrder(
        OrderId.of(orderId),
        ConsumerId.of(caller.accountId.toString()),
        caller.role,
      ),
    );
  }

  @Post(':orderId/revise')
  @HttpCode(HttpStatus.OK)
  public async revise(
    @CurrentCaller() caller: Caller,
    @Param('orderId', new SchemaValidationPipe(OrderIdParameter)) orderId: string,
    @Body(new SchemaValidationPipe(ReviseOrderRequest)) body: ReviseOrderRequest,
  ): Promise<OrderResponse> {
    return new OrderResponse(
      await this.ordersService.reviseOrder(
        OrderId.of(orderId),
        ConsumerId.of(caller.accountId.toString()),
        caller.role,
        this.requestedLineItemsOf(body.lineItems),
      ),
    );
  }

  private requestedLineItemsOf(
    lineItems: ReadonlyArray<LineItemRequest>,
  ): ReadonlyArray<RequestedLineItem> {
    return lineItems.map(
      (item) => new RequestedLineItem(MenuItemId.of(item.menuItemId), Quantity.of(item.quantity)),
    );
  }
}
