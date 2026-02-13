import { Inject, Injectable } from '@nestjs/common';

import { MessageBroker } from '../../broker/message-broker.js';
import { DEAD_LETTER_SUFFIX } from '../../infrastructure.constants.js';

import { DeadLetterHeader } from './dead-letter-header.js';
import type { Failure } from './failure.js';

@Injectable()
export class DeadLetters {
  public constructor(@Inject(MessageBroker) private readonly broker: MessageBroker) {}

  public async send(failure: Failure): Promise<void> {
    const { delivery } = failure;
    await this.broker.publish([
      {
        topic: `${delivery.position.topic}${DEAD_LETTER_SUFFIX}`,
        key: delivery.key,
        value: delivery.value,
        headers: {
          ...delivery.headers,
          [DeadLetterHeader.ErrorCode]: failure.code,
          [DeadLetterHeader.ErrorMessage]: failure.description,
          [DeadLetterHeader.Attempts]: String(failure.attempt),
          [DeadLetterHeader.SourceTopic]: delivery.position.topic,
          [DeadLetterHeader.SourcePartition]: String(delivery.position.partition),
          [DeadLetterHeader.SourceOffset]: delivery.position.offset,
        },
      },
    ]);
  }
}
