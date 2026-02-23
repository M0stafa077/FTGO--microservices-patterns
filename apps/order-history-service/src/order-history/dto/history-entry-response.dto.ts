import type { Money as MoneyPayload } from '@ftgo/contracts';

import type { OrderHistoryEntry } from '../entities/order-history-entry.entity.js';
import { LineItemPayloads } from '../line-item-payloads.js';
import type { HistoryLineItemDocument } from '../schemas/history-line-item-document.schema.js';

export class HistoryEntryResponse {
  public readonly orderId: string;
  public readonly restaurantId: string;
  public readonly restaurantName: string;
  public readonly state: string;
  public readonly lineItems: ReadonlyArray<HistoryLineItemDocument>;
  public readonly orderTotal: MoneyPayload;
  public readonly createdAt: string;

  public constructor(entry: OrderHistoryEntry) {
    const payloads = new LineItemPayloads();
    this.orderId = entry.id.toString();
    this.restaurantId = entry.restaurantId.toString();
    this.restaurantName = entry.restaurantName;
    this.state = entry.state;
    this.lineItems = payloads.fromLineItems(entry.lineItems);
    this.orderTotal = payloads.fromMoney(entry.orderTotal);
    this.createdAt = entry.createdAt.toISOString();
  }
}
