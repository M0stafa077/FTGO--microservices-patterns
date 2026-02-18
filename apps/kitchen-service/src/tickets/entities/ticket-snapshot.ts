import type { RestaurantId } from '../../restaurants/entities/restaurant-id.js';

import type { TicketId } from './ticket-id.js';
import type { TicketLineItems } from './ticket-line-items.js';
import type { TicketState } from './ticket-state.js';

export interface TicketSnapshot {
  readonly id: TicketId;
  readonly restaurantId: RestaurantId;
  readonly lineItems: TicketLineItems;
  readonly state: TicketState;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}
