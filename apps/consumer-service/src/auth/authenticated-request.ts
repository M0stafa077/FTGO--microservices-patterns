import type { Request } from 'express';

import type { Principal } from './principal.js';

export interface AuthenticatedRequest extends Request {
  principal?: Principal;
}
