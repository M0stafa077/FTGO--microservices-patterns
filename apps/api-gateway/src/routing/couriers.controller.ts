import { Controller, Inject, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { ServiceName } from '../config/service-name.js';

import { Forwarding } from './forwarding.js';

@Controller('couriers')
export class CouriersController {
  public constructor(@Inject(Forwarding) private readonly forwarding: Forwarding) {}

  @Post(':courierId/availability')
  public async updateAvailability(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwarding.forward(ServiceName.Delivery, request, response);
  }
}
