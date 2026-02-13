import { Clock } from '@ftgo/common';
import { CompiledSchema, PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'kysely';

import { OUTBOX_RELAY_LOCK } from '../infrastructure.constants.js';
import { MessagingDatabase } from '../persistence/messaging-database.js';

import { StoredHeaders } from './schemas/stored-headers.schema.js';
import { UnpublishedMessage } from './unpublished-message.js';

@Injectable()
export class OutboxBatches {
  private readonly storedHeaders = new CompiledSchema(StoredHeaders);

  public constructor(
    @Inject(MessagingDatabase) private readonly database: MessagingDatabase,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async lock(): Promise<boolean> {
    try {
      const result = await sql<{
        isLocked: boolean;
      }>`select pg_try_advisory_xact_lock(${OUTBOX_RELAY_LOCK}) as is_locked`.execute(
        this.database.current(),
      );
      return result.rows[0]?.isLocked === true;
    } catch (error) {
      return PostgresFailure.of(error).rethrow('lock the outbox relay');
    }
  }

  public async next(limit: number): Promise<ReadonlyArray<UnpublishedMessage>> {
    try {
      const rows = await this.database
        .current()
        .selectFrom('outboxMessages')
        .selectAll()
        .where('publishedAt', 'is', null)
        .orderBy('sequence')
        .limit(limit)
        .forUpdate()
        .execute();
      return rows.map((row) => UnpublishedMessage.fromRow(row, this.headersOf(row.headers)));
    } catch (error) {
      return PostgresFailure.of(error).rethrow('read unpublished outbox messages');
    }
  }

  public async markPublished(messages: ReadonlyArray<UnpublishedMessage>): Promise<void> {
    try {
      await this.database
        .current()
        .updateTable('outboxMessages')
        .set({ publishedAt: this.clock.now() })
        .where(
          'id',
          'in',
          messages.map((message) => message.id),
        )
        .execute();
    } catch (error) {
      PostgresFailure.of(error).rethrow('mark outbox messages published');
    }
  }

  private headersOf(stored: unknown): Readonly<Record<string, string>> {
    return this.storedHeaders.parse(
      stored,
      'outbox.invalid_headers',
      'An outbox row has invalid headers.',
    );
  }
}
