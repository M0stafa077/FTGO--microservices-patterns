import { HeaderName } from '../../envelope/header-name.js';

import type { DeliveryPosition } from './delivery-position.js';

export class Delivery {
  public constructor(
    public readonly position: DeliveryPosition,
    public readonly key: string | null,
    public readonly value: string | null,
    public readonly headers: Readonly<Record<string, string>>,
  ) {}

  public get topic(): string {
    return this.position.topic;
  }

  public get type(): string | undefined {
    return this.headers[HeaderName.Type];
  }

  public get positionId(): string {
    return `${this.position.topic}/${String(this.position.partition)}@${this.position.offset}`;
  }
}
