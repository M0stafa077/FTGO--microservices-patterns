import type { KafkaJS } from '@confluentinc/kafka-javascript';
import type { Duration } from '@ftgo/common';

import type { PartitionControl } from '../receiving/dispositions/partition-control.js';

import type { RetryTimers } from './retry-timers.js';

export class KafkaPartitionControl implements PartitionControl {
  public constructor(
    private readonly consumer: KafkaJS.Consumer,
    private readonly payload: KafkaJS.EachMessagePayload,
    private readonly timers: RetryTimers,
  ) {}

  public async commit(): Promise<void> {
    await this.consumer.commitOffsets([
      {
        topic: this.payload.topic,
        partition: this.payload.partition,
        offset: (BigInt(this.payload.message.offset) + 1n).toString(),
      },
    ]);
  }

  public retryAfter(delay: Duration): void {
    const resume = this.payload.pause();
    this.consumer.seek({
      topic: this.payload.topic,
      partition: this.payload.partition,
      offset: this.payload.message.offset,
    });
    this.timers.schedule(delay, resume);
  }
}
