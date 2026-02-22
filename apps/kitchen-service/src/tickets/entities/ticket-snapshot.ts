import type { RestaurantId } from '../../restaurants/entities/restaurant-id.js';

import type { ConsumerId } from './consumer-id.js';
import type { TicketId } from './ticket-id.js';
import type { TicketLineItems } from './ticket-line-items.js';
import type { TicketState } from './ticket-state.js';

export interface TicketSnapshot {
  readonly id: TicketId;
  readonly restaurantId: RestaurantId;
  readonly consumerId: ConsumerId | undefined;
  readonly lineItems: TicketLineItems;
  readonly state: TicketState;
  readonly previousState: TicketState | undefined;
  readonly readyBy: Date | undefined;
  readonly acceptedAt: Date | undefined;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}
