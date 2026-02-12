import type { Duration } from '@ftgo/common';

import type { ConsumerId } from '../../consumers/entities/consumer-id.js';
import { InvalidRefreshToken } from '../errors/invalid-refresh-token.js';

import type { RefreshToken } from './refresh-token.js';
import { RevocationReason } from './revocation-reason.js';
import { RotationOutcome } from './rotation-outcome.js';
import type { SessionId } from './session-id.js';
import type { SessionState } from './session-state.js';

export class Session {
  public readonly id: SessionId;
  public readonly consumerId: ConsumerId;
  public readonly startedAt: Date;
  public readonly expiresAt: Date;
  public readonly version: number;
  private currentRefreshTokenHash: string;
  private lastRefreshedAt: Date;
  private revokedAt: Date | undefined;
  private revocationReason: RevocationReason | undefined;

  private constructor(state: SessionState) {
    this.id = state.id;
    this.consumerId = state.consumerId;
    this.startedAt = state.startedAt;
    this.expiresAt = state.expiresAt;
    this.version = state.version;
    this.currentRefreshTokenHash = state.refreshTokenHash;
    this.lastRefreshedAt = state.lastRefreshedAt;
    this.revokedAt = state.revokedAt;
    this.revocationReason = state.revocationReason;
  }

  public static start(
    consumerId: ConsumerId,
    refreshToken: RefreshToken,
    now: Date,
    lifetime: Duration,
  ): Session {
    return new Session({
      id: refreshToken.sessionId,
      consumerId,
      refreshTokenHash: refreshToken.hash(),
      startedAt: now,
      expiresAt: lifetime.addTo(now),
      lastRefreshedAt: now,
      revokedAt: undefined,
      revocationReason: undefined,
      version: 0,
    });
  }

  public static restore(state: SessionState): Session {
    return new Session(state);
  }

  public state(): SessionState {
    return {
      id: this.id,
      consumerId: this.consumerId,
      refreshTokenHash: this.currentRefreshTokenHash,
      startedAt: this.startedAt,
      expiresAt: this.expiresAt,
      lastRefreshedAt: this.lastRefreshedAt,
      revokedAt: this.revokedAt,
      revocationReason: this.revocationReason,
      version: this.version,
    };
  }

  public isActive(now: Date): boolean {
    return this.revokedAt === undefined && now < this.expiresAt;
  }

  public rotate(presented: RefreshToken, next: RefreshToken, now: Date): RotationOutcome {
    if (!this.isActive(now) || !next.sessionId.equals(this.id)) {
      throw new InvalidRefreshToken();
    }
    if (!presented.matches(this.currentRefreshTokenHash)) {
      this.revoke(RevocationReason.RefreshTokenReuse, now);
      return RotationOutcome.ReuseDetected;
    }
    this.currentRefreshTokenHash = next.hash();
    this.lastRefreshedAt = now;
    return RotationOutcome.Rotated;
  }

  public end(now: Date): void {
    if (this.revokedAt === undefined) {
      this.revoke(RevocationReason.SignedOut, now);
    }
  }

  private revoke(reason: RevocationReason, now: Date): void {
    this.revokedAt = now;
    this.revocationReason = reason;
  }
}
