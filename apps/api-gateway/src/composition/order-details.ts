import type { OrderPart } from './order-part.js';
import type { AuthorizationView } from './schemas/authorization-view.schema.js';
import type { DeliveryView } from './schemas/delivery-view.schema.js';
import type { OrderView } from './schemas/order-view.schema.js';
import type { TicketView } from './schemas/ticket-view.schema.js';

export class OrderDetails {
  public constructor(
    public readonly order: OrderView,
    public readonly ticket: TicketView | undefined,
    public readonly delivery: DeliveryView | undefined,
    public readonly authorization: AuthorizationView | undefined,
    public readonly unavailable: ReadonlyArray<OrderPart>,
  ) {}
}
