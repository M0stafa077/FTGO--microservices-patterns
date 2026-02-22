import { Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { ServiceName } from '../config/service-name.js';

import { Forwarding } from './forwarding.js';

@Controller('tickets')
export class TicketsController {
  public constructor(@Inject(Forwarding) private readonly forwarding: Forwarding) {}

  @Get(':ticketId')
  public async get(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Kitchen, request, response);
  }

  @Post(':ticketId/accept')
  public async accept(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Kitchen, request, response);
  }
}
