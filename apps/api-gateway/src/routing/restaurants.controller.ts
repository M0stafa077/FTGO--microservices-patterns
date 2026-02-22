import { Controller, Get, Inject, Post, Put, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { ServiceName } from '../config/service-name.js';

import { Forwarding } from './forwarding.js';

@Controller('restaurants')
export class RestaurantsController {
  public constructor(@Inject(Forwarding) private readonly forwarding: Forwarding) {}

  @Post()
  public async create(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Restaurant, request, response);
  }

  @Get(':restaurantId')
  public async get(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Restaurant, request, response);
  }

  @Put(':restaurantId/menu')
  public async reviseMenu(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Restaurant, request, response);
  }
}
