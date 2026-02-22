import type { Money } from '@ftgo/contracts';

import type { OrderDetails } from '../order-details.js';
import type { OrderPart } from '../order-part.js';
import type { OrderView } from '../schemas/order-view.schema.js';

export class OrderDetailsResponse {
  public readonly order: OrderView;
  public readonly ticket: {
    readonly state: string;
    readonly readyBy: string | null;
    readonly acceptedAt: string | null;
  } | null;
  public readonly delivery: {
    readonly state: string;
    readonly pickupTime: string | null;
    readonly deliveryTime: string | null;
    readonly courierId: string | null;
  } | null;
  public readonly authorization: { readonly amount: Money; readonly isReversed: boolean } | null;
  public readonly unavailable: ReadonlyArray<OrderPart>;

  public constructor(details: OrderDetails) {
    const { ticket, delivery, authorization } = details;
    this.order = details.order;
    this.ticket =
      ticket === undefined
        ? null
        : { state: ticket.state, readyBy: ticket.readyBy, acceptedAt: ticket.acceptedAt };
    this.delivery =
      delivery === undefined
        ? null
        : {
            state: delivery.state,
            pickupTime: delivery.pickupTime,
            deliveryTime: delivery.deliveryTime,
            courierId: delivery.courierId,
          };
    this.authorization =
      authorization === undefined
        ? null
        : { amount: authorization.amount, isReversed: authorization.isReversed };
    this.unavailable = details.unavailable;
  }
}
