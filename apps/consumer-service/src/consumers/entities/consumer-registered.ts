import type { ConsumerId } from './consumer-id.js';
import type { PersonName } from './person-name.js';

export class ConsumerRegistered {
  public constructor(
    public readonly consumerId: ConsumerId,
    public readonly name: PersonName,
  ) {}
}
