import { Controller, Get, Inject, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { ServiceName } from '../config/service-name.js';

import { Forwarding } from './forwarding.js';

@Controller('accounts')
export class AccountsController {
  public constructor(@Inject(Forwarding) private readonly forwarding: Forwarding) {}

  @Get(':accountId/authorizations/:orderId')
  public async getAuthorization(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Accounting, request, response);
  }
}
