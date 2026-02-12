import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { AuthenticatedRequest } from '../authenticated-request.js';
import { InvalidAccessToken } from '../errors/invalid-access-token.js';
import type { Principal } from '../principal.js';

export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Principal => {
    const principal = context.switchToHttp().getRequest<AuthenticatedRequest>().principal;
    if (principal === undefined) {
      throw new InvalidAccessToken();
    }
    return principal;
  },
);
