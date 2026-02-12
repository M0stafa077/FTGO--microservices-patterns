import type { ConsumerId } from '../../consumers/entities/consumer-id.js';

import type { RevocationReason } from './revocation-reason.js';
import type { SessionId } from './session-id.js';

export interface SessionState {
  readonly id: SessionId;
  readonly consumerId: ConsumerId;
  readonly refreshTokenHash: string;
  readonly startedAt: Date;
  readonly expiresAt: Date;
  readonly lastRefreshedAt: Date;
  readonly revokedAt: Date | undefined;
  readonly revocationReason: RevocationReason | undefined;
  readonly version: number;
}
