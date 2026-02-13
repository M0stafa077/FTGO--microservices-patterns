import { Clock } from '@ftgo/common';
import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { MessagingDatabase } from './messaging-database.js';
import type { ProcessedMessages } from './processed-messages.js';

@Injectable()
export class PostgresProcessedMessages implements ProcessedMessages {
  public constructor(
    @Inject(MessagingDatabase) private readonly database: MessagingDatabase,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async markProcessed(consumerGroup: string, messageId: string): Promise<boolean> {
    try {
      const result = await this.database
        .current()
        .insertInto('processedMessages')
        .values({ consumerGroup, messageId, processedAt: this.clock.now() })
        .onConflict((conflict) => conflict.columns(['consumerGroup', 'messageId']).doNothing())
        .executeTakeFirst();
      return result.numInsertedOrUpdatedRows === 1n;
    } catch (error) {
      return PostgresFailure.of(error).rethrow('mark message processed');
    }
  }
}
