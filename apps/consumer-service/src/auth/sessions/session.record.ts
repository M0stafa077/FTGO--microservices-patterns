import { InvalidInput } from '@ftgo/common';

import { ConsumerId } from '../../consumers/entities/consumer-id.js';
import type { SessionsTable } from '../../database/tables/sessions.table.js';
import { RevocationReason } from '../entities/revocation-reason.js';
import { SessionId } from '../entities/session-id.js';
import { Session } from '../entities/session.entity.js';

export class SessionRecord {
  private static readonly REASONS: ReadonlyMap<string, RevocationReason> = new Map(
    Object.values(RevocationReason).map((reason) => [reason, reason]),
  );

  private constructor(private readonly row: SessionsTable) {}

  public static fromRow(row: SessionsTable): SessionRecord {
    return new SessionRecord(row);
  }

  public static from(session: Session): SessionRecord {
    const state = session.state();
    return new SessionRecord({
      id: state.id.toString(),
      consumerId: state.consumerId.toString(),
      refreshTokenHash: state.refreshTokenHash,
      startedAt: state.startedAt,
      expiresAt: state.expiresAt,
      lastRefreshedAt: state.lastRefreshedAt,
      revokedAt: state.revokedAt ?? null,
      revocationReason: state.revocationReason ?? null,
      version: state.version,
    });
  }

  public toSession(): Session {
    return Session.restore({
      id: SessionId.of(this.row.id),
      consumerId: ConsumerId.of(this.row.consumerId),
      refreshTokenHash: this.row.refreshTokenHash,
      startedAt: this.row.startedAt,
      expiresAt: this.row.expiresAt,
      lastRefreshedAt: this.row.lastRefreshedAt,
      revokedAt: this.row.revokedAt ?? undefined,
      revocationReason: this.revocationReason(),
      version: this.row.version,
    });
  }

  public toRow(): SessionsTable {
    return { ...this.row };
  }

  private revocationReason(): RevocationReason | undefined {
    if (this.row.revocationReason === null) {
      return undefined;
    }
    const reason = SessionRecord.REASONS.get(this.row.revocationReason);
    if (reason === undefined) {
      throw new InvalidInput(
        'session.unknown_revocation_reason',
        `Unknown revocation reason "${this.row.revocationReason}".`,
      );
    }
    return reason;
  }
}
