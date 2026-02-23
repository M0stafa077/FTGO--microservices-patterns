import { Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { ServiceName } from '../config/service-name.js';

import { Forwarding } from './forwarding.js';

@Controller('orders')
export class OrdersController {
  public constructor(@Inject(Forwarding) private readonly forwarding: Forwarding) {}

  @Get()
  public async findOrders(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.OrderHistory, request, response);
  }

  @Post()
  public async placeOrder(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Order, request, response);
  }

  @Post(':orderId/cancel')
  public async cancel(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Order, request, response);
  }

  @Post(':orderId/revise')
  public async revise(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Order, request, response);
  }
}
