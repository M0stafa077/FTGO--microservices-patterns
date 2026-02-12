import type { ConsumerId } from '../consumers/entities/consumer-id.js';

import type { SessionId } from './entities/session-id.js';

export class Principal {
  public constructor(
    public readonly consumerId: ConsumerId,
    public readonly sessionId: SessionId,
  ) {}
}
