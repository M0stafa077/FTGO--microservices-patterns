import type { OrderId } from './entities/order-id.js';
import type { TicketView } from './schemas/ticket-view.schema.js';

export interface Tickets {
  findByOrderId(orderId: OrderId, authorization: string): Promise<TicketView | undefined>;
}
export const Tickets = Symbol('Tickets');
