import type { Request, Response } from 'express';

import type { ServiceName } from '../config/service-name.js';

export interface Forwarding {
  forward(service: ServiceName, request: Request, response: Response): Promise<void>;
}
export const Forwarding = Symbol('Forwarding');
