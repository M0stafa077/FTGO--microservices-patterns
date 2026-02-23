import { Forbidden } from '@ftgo/common';

import type { ConsumerId } from '../entities/consumer-id.js';

export class HistoryNotOwned extends Forbidden {
  public constructor(consumerId: ConsumerId) {
    super(
      'order_history.not_owned',
      `Only consumer ${consumerId.toString()} or an admin can read this order history.`,
    );
  }
}
