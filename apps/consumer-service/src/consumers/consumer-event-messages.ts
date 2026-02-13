import { ConsumerCreated } from '@ftgo/contracts';
import { OutgoingMessage } from '@ftgo/messaging';
import { Injectable } from '@nestjs/common';

import type { ConsumerRegistered } from './entities/consumer-registered.js';

@Injectable()
export class ConsumerEventMessages {
  public of(event: ConsumerRegistered): OutgoingMessage {
    const consumerId = event.consumerId.toString();
    return OutgoingMessage.event(ConsumerCreated, consumerId, {
      consumerId,
      name: { firstName: event.name.firstName, lastName: event.name.lastName },
    });
  }
}
