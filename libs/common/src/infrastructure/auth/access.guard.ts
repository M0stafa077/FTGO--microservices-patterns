import { Inject, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import type { Role } from '../../identity/role.js';
import { BEARER_TOKEN_FORMAT } from '../infrastructure.constants.js';

import { InvalidAccessToken } from './errors/invalid-access-token.js';
import { MissingRole } from './errors/missing-role.js';
import { Public } from './public.decorator.js';
import { RemoteAccessTokens } from './remote-access-tokens.js';
import { Requires } from './requires.decorator.js';

@Injectable()
export class AccessGuard implements CanActivate {
  public constructor(
    @Inject(RemoteAccessTokens) private readonly accessTokens: RemoteAccessTokens,
    private readonly reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride(Public, targets)) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const caller = await this.accessTokens.verify(this.bearerToken(request));
    const requiredRole = this.reflector.getAllAndOverride<Role, Role | undefined>(
      Requires,
      targets,
    );
    if (requiredRole !== undefined && caller.role !== requiredRole) {
      throw new MissingRole(requiredRole);
    }
    return true;
  }

  private bearerToken(request: Request): string {
    const token = BEARER_TOKEN_FORMAT.exec(request.headers.authorization ?? '')?.[1];
    if (token === undefined) {
      throw new InvalidAccessToken();
    }
    return token;
  }
}
