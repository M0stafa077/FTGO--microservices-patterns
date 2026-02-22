import { Controller, Get, Inject, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { ServiceName } from '../config/service-name.js';

import { Forwarding } from './forwarding.js';

@Controller('deliveries')
export class DeliveriesController {
  public constructor(@Inject(Forwarding) private readonly forwarding: Forwarding) {}

  @Get(':deliveryId')
  public async get(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Delivery, request, response);
  }
}
