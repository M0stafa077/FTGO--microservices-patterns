import { Inject, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { BEARER_TOKEN_FORMAT } from '../auth.constants.js';
import type { AuthenticatedRequest } from '../authenticated-request.js';
import { Public } from '../decorators/public.decorator.js';
import { InvalidAccessToken } from '../errors/invalid-access-token.js';
import { AccessTokens } from '../tokens/access-tokens.js';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  public constructor(
    @Inject(AccessTokens) private readonly accessTokens: AccessTokens,
    private readonly reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublic(context)) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.principal = await this.accessTokens.verify(this.bearerToken(request));
    return true;
  }

  private isPublic(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride(Public, [context.getHandler(), context.getClass()]);
  }

  private bearerToken(request: AuthenticatedRequest): string {
    const token = BEARER_TOKEN_FORMAT.exec(request.headers.authorization ?? '')?.[1];
    if (token === undefined) {
      throw new InvalidAccessToken();
    }
    return token;
  }
}
