import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { CallerRequest } from './caller-request.js';
import type { Caller } from './caller.js';
import { InvalidAccessToken } from './errors/invalid-access-token.js';

export const CurrentCaller = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Caller => {
    const caller = context.switchToHttp().getRequest<CallerRequest>().caller;
    if (caller === undefined) {
      throw new InvalidAccessToken();
    }
    return caller;
  },
);
