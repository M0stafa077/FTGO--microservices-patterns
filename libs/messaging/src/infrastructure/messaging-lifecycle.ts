import { Duration } from '@ftgo/common';
import {
  Injectable,
  Logger,
  type BeforeApplicationShutdown,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';

import { CONNECT_MAX_BACKOFF_MS, INITIAL_BACKOFF_MS } from './infrastructure.constants.js';
import { KafkaMessageBroker } from './kafka/kafka-message-broker.js';
import { KafkaSubscriber } from './kafka/kafka-subscriber.js';
import { OutboxRelay } from './relay/outbox-relay.js';
import { RetentionCleanup } from './relay/retention-cleanup.js';
import { Backoff } from './time/backoff.js';
import { CancellableDelay } from './time/cancellable-delay.js';

@Injectable()
export class MessagingLifecycle
  implements OnApplicationBootstrap, BeforeApplicationShutdown, OnApplicationShutdown
{
  private readonly logger = new Logger(MessagingLifecycle.name);
  private readonly stopping = new AbortController();
  private readonly delay = new CancellableDelay();
  private readonly backoff = new Backoff(
    Duration.ofMilliseconds(INITIAL_BACKOFF_MS),
    Duration.ofMilliseconds(CONNECT_MAX_BACKOFF_MS),
  );
  private readonly tasks: Promise<void>[] = [];

  public constructor(
    private readonly broker: KafkaMessageBroker,
    private readonly subscriber: KafkaSubscriber,
    private readonly relay: OutboxRelay,
    private readonly cleanup: RetentionCleanup,
  ) {}

  public onApplicationBootstrap(): void {
    const { signal } = this.stopping;
    this.tasks.push(this.publishOutbox(signal), this.cleanup.run(signal));
    if (this.subscriber.hasSubscriptions()) {
      this.tasks.push(this.keepConnecting('consumer', async () => this.subscriber.start(), signal));
    }
  }

  public async beforeApplicationShutdown(): Promise<void> {
    this.stopping.abort();
    await Promise.all(this.tasks);
    await this.subscriber.stop();
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.broker.disconnect();
  }

  private async publishOutbox(signal: AbortSignal): Promise<void> {
    await this.keepConnecting('producer', async () => this.broker.connect(), signal);
    await this.relay.run(signal);
  }

  private async keepConnecting(
    client: string,
    connect: () => Promise<void>,
    signal: AbortSignal,
  ): Promise<void> {
    for (let attempt = 1; !signal.aborted; attempt += 1) {
      try {
        await connect();
        this.logger.log({ client }, 'connected to Kafka');
        return;
      } catch (error) {
        const delay = this.backoff.delayFor(attempt);
        this.logger.warn(
          { err: error, client, attempt, retryInMs: delay.toMilliseconds() },
          'could not connect to Kafka; retrying',
        );
        await this.delay.wait(delay, signal);
      }
    }
  }
}
