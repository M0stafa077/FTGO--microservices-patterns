import type { Request } from 'express';

import type { Caller } from './caller.js';

export interface CallerRequest extends Request {
  caller?: Caller;
}
