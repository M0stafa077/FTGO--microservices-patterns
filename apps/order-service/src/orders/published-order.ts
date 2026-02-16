import type { Money } from '@ftgo/common';
import type {
  Address as AddressPayload,
  Money as MoneyPayload,
  OrderLineItem as OrderLineItemPayload,
} from '@ftgo/contracts';

import type { Order } from './entities/order.entity.js';

export class PublishedOrder {
  public constructor(private readonly order: Order) {}

  public lineItems(): OrderLineItemPayload[] {
    return this.order.lineItems.items.map((item) => ({
      menuItemId: item.menuItemId.toString(),
      name: item.name.toString(),
      price: this.money(item.price),
      quantity: item.quantity.value,
    }));
  }

  public total(): MoneyPayload {
    return this.money(this.order.total());
  }

  public deliveryAddress(): AddressPayload {
    const { address } = this.order.deliveryInformation;
    return {
      street1: address.street1,
      ...(address.street2 === undefined ? {} : { street2: address.street2 }),
      city: address.city,
      state: address.state,
      zip: address.zip,
    };
  }

  private money(money: Money): MoneyPayload {
    return { amount: money.amount, currency: money.currency.toString() };
  }
}
