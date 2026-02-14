import type { Address } from '@ftgo/common';
import type { Address as AddressPayload } from '@ftgo/contracts';

export class PublishedAddress {
  public constructor(private readonly address: Address) {}

  public toPayload(): AddressPayload {
    return {
      street1: this.address.street1,
      ...(this.address.street2 === undefined ? {} : { street2: this.address.street2 }),
      city: this.address.city,
      state: this.address.state,
      zip: this.address.zip,
    };
  }
}
