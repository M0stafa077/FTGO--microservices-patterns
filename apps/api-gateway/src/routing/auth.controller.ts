import { Public } from '@ftgo/common/infrastructure';
import { Controller, Inject, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { ServiceName } from '../config/service-name.js';

import { Forwarding } from './forwarding.js';

@Controller('auth')
export class AuthController {
  public constructor(@Inject(Forwarding) private readonly forwarding: Forwarding) {}

  @Public()
  @Post('register')
  public async register(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Consumer, request, response);
  }

  @Public()
  @Post('sign-in')
  public async signIn(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Consumer, request, response);
  }

  @Public()
  @Post('refresh')
  public async refresh(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Consumer, request, response);
  }

  @Post('sign-out')
  public async signOut(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.forwarding.forward(ServiceName.Consumer, request, response);
  }
}
