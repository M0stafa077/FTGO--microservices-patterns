import { ConcurrentModification } from '@ftgo/common';
import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { ConsumerDatabase } from '../../database/consumer-database.js';
import type { SessionsTable } from '../../database/tables/sessions.table.js';
import type { SessionId } from '../entities/session-id.js';
import type { Session } from '../entities/session.entity.js';

import { SessionRecord } from './session.record.js';
import type { Sessions } from './sessions.js';

@Injectable()
export class PostgresSessions implements Sessions {
  public constructor(@Inject(ConsumerDatabase) private readonly database: ConsumerDatabase) {}

  public async findById(id: SessionId): Promise<Session | undefined> {
    try {
      const row = await this.database
        .current()
        .selectFrom('sessions')
        .selectAll()
        .where('id', '=', id.toString())
        .executeTakeFirst();
      return row === undefined ? undefined : SessionRecord.fromRow(row).toSession();
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find session');
    }
  }

  public async add(session: Session): Promise<void> {
    try {
      await this.database
        .current()
        .insertInto('sessions')
        .values(SessionRecord.from(session).toRow())
        .execute();
    } catch (error) {
      PostgresFailure.of(error).rethrow('add session');
    }
  }

  public async update(session: Session): Promise<void> {
    const row = SessionRecord.from(session).toRow();
    const updatedRows = await this.updateRow(row);
    if (updatedRows === 0n) {
      throw new ConcurrentModification('Session', row.id);
    }
  }

  private async updateRow(row: SessionsTable): Promise<bigint> {
    try {
      const result = await this.database
        .current()
        .updateTable('sessions')
        .set({
          refreshTokenHash: row.refreshTokenHash,
          lastRefreshedAt: row.lastRefreshedAt,
          revokedAt: row.revokedAt,
          revocationReason: row.revocationReason,
          version: row.version + 1,
        })
        .where('id', '=', row.id)
        .where('version', '=', row.version)
        .executeTakeFirst();
      return result.numUpdatedRows;
    } catch (error) {
      return PostgresFailure.of(error).rethrow('update session');
    }
  }
}
