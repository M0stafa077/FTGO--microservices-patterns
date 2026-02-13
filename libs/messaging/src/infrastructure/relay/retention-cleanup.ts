import { Clock, Duration } from '@ftgo/common';
import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql, type RawBuilder } from 'kysely';

import {
  RETENTION_CLEANUP_INTERVAL_MS,
  RETENTION_DELETE_BATCH_SIZE,
} from '../infrastructure.constants.js';
import { MessagingOptions } from '../messaging-options.js';
import { MessagingDatabase } from '../persistence/messaging-database.js';
import { CancellableDelay } from '../time/cancellable-delay.js';

@Injectable()
export class RetentionCleanup {
  private readonly logger = new Logger(RetentionCleanup.name);
  private readonly delay = new CancellableDelay();

  public constructor(
    @Inject(MessagingDatabase) private readonly database: MessagingDatabase,
    @Inject(MessagingOptions) private readonly options: MessagingOptions,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async run(signal: AbortSignal): Promise<void> {
    while (!signal.aborted) {
      await this.cleanOnce();
      await this.delay.wait(Duration.ofMilliseconds(RETENTION_CLEANUP_INTERVAL_MS), signal);
    }
  }

  private async cleanOnce(): Promise<void> {
    try {
      const outboxMessages = await this.deleteAll(
        (cutoff) => this.publishedBefore(cutoff),
        this.options.config.outbox.retention,
      );
      const processedMessages = await this.deleteAll(
        (cutoff) => this.processedBefore(cutoff),
        this.options.config.handlers.processedMessagesRetention,
      );
      if (outboxMessages + processedMessages > 0) {
        this.logger.log({ outboxMessages, processedMessages }, 'old messaging rows deleted');
      }
    } catch (error) {
      this.logger.warn({ err: error }, 'messaging retention cleanup failed; retrying later');
    }
  }

  private async deleteAll(
    statementFor: (cutoff: Date) => RawBuilder<unknown>,
    retention: Duration,
  ): Promise<number> {
    const cutoff = retention.subtractFrom(this.clock.now());
    let total = 0;
    let deleted = RETENTION_DELETE_BATCH_SIZE;
    while (deleted === RETENTION_DELETE_BATCH_SIZE) {
      deleted = await this.deleteBatch(statementFor(cutoff));
      total += deleted;
    }
    return total;
  }

  private async deleteBatch(statement: RawBuilder<unknown>): Promise<number> {
    try {
      const result = await statement.execute(this.database.current());
      return Number(result.numAffectedRows ?? 0n);
    } catch (error) {
      return PostgresFailure.of(error).rethrow('delete old messaging rows');
    }
  }

  private publishedBefore(cutoff: Date): RawBuilder<unknown> {
    return sql`delete from outbox_messages where id in (
      select id from outbox_messages
      where published_at < ${cutoff}
      limit ${RETENTION_DELETE_BATCH_SIZE})`;
  }

  private processedBefore(cutoff: Date): RawBuilder<unknown> {
    return sql`delete from processed_messages where (consumer_group, message_id) in (
      select consumer_group, message_id from processed_messages
      where processed_at < ${cutoff}
      limit ${RETENTION_DELETE_BATCH_SIZE})`;
  }
}
