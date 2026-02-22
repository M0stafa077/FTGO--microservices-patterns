import { Controller, Get, Inject, Put, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { ServiceName } from '../config/service-name.js';

import { Forwarding } from './forwarding.js';

@Controller('consumers/me')
export class ConsumersController {
  public constructor(@Inject(Forwarding) private readonly forwarding: Forwarding) {}

  @Get()
  public async getProfile(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Consumer, request, response);
  }

  @Put()
  public async updateProfile(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Consumer, request, response);
  }
}
