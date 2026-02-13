import { Clock, Duration, Transactions } from '@ftgo/common';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { MessageBroker } from '../broker/message-broker.js';
import { CONNECT_MAX_BACKOFF_MS, INITIAL_BACKOFF_MS } from '../infrastructure.constants.js';
import { MessagingOptions } from '../messaging-options.js';
import { Backoff } from '../time/backoff.js';
import { CancellableDelay } from '../time/cancellable-delay.js';

import { OutboxBatches } from './outbox-batches.js';
import type { UnpublishedMessage } from './unpublished-message.js';

@Injectable()
export class OutboxRelay {
  private readonly logger = new Logger(OutboxRelay.name);
  private readonly delay = new CancellableDelay();
  private readonly backoff = new Backoff(
    Duration.ofMilliseconds(INITIAL_BACKOFF_MS),
    Duration.ofMilliseconds(CONNECT_MAX_BACKOFF_MS),
  );
  private consecutiveFailures = 0;

  public constructor(
    @Inject(Transactions) private readonly transactions: Transactions,
    private readonly batches: OutboxBatches,
    @Inject(MessageBroker) private readonly broker: MessageBroker,
    @Inject(MessagingOptions) private readonly options: MessagingOptions,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public isHealthy(): boolean {
    return this.consecutiveFailures === 0;
  }

  public async run(signal: AbortSignal): Promise<void> {
    while (!signal.aborted) {
      const pause = await this.pollOnce();
      if (pause !== undefined) {
        await this.delay.wait(pause, signal);
      }
    }
  }

  private async pollOnce(): Promise<Duration | undefined> {
    try {
      const published = await this.transactions.run(async () => this.publishBatch());
      this.consecutiveFailures = 0;
      return published < this.options.config.outbox.batchSize
        ? this.options.config.outbox.pollInterval
        : undefined;
    } catch (error) {
      this.consecutiveFailures += 1;
      this.logger.warn(
        { err: error, attempt: this.consecutiveFailures },
        'outbox relay could not publish; retrying with backoff',
      );
      return this.backoff.delayFor(this.consecutiveFailures);
    }
  }

  private async publishBatch(): Promise<number> {
    if (!(await this.batches.lock())) {
      return 0;
    }
    const messages = await this.batches.next(this.options.config.outbox.batchSize);
    if (messages.length === 0) {
      return 0;
    }
    await this.broker.publish(messages.map((message) => message.brokerMessage));
    await this.batches.markPublished(messages);
    this.logger.log(
      { published: messages.length, lagMs: this.lagOf(messages) },
      'outbox messages published',
    );
    return messages.length;
  }

  private lagOf(messages: ReadonlyArray<UnpublishedMessage>): number {
    const oldest = messages[0]?.createdAt ?? this.clock.now();
    return this.clock.now().getTime() - oldest.getTime();
  }
}
