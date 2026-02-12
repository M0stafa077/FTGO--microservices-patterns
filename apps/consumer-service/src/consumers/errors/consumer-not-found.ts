import { ResourceNotFound } from '@ftgo/common';

import type { ConsumerId } from '../entities/consumer-id.js';

export class ConsumerNotFound extends ResourceNotFound {
  public constructor(id: ConsumerId) {
    super('consumer.not_found', `Consumer ${id.toString()} does not exist.`);
  }
}
