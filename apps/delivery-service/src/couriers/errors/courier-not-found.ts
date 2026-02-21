import { ResourceNotFound } from '@ftgo/common';

import type { CourierId } from '../entities/courier-id.js';

export class CourierNotFound extends ResourceNotFound {
  public constructor(id: CourierId) {
    super('courier.not_found', `Courier ${id.toString()} does not exist.`);
  }
}
