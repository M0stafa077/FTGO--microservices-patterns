import { InvalidInput } from '@ftgo/common';
import { CompiledSchema } from '@ftgo/common/infrastructure';
import { Value } from 'typebox/value';

import type { OrderHistoryTable } from '../database/tables/order-history.table.js';

import { ConsumerId } from './entities/consumer-id.js';
import { OrderHistoryEntry } from './entities/order-history-entry.entity.js';
import { OrderId } from './entities/order-id.js';
import type { OrderState } from './entities/order-state.js';
import { RestaurantId } from './entities/restaurant-id.js';
import { LineItemPayloads } from './line-item-payloads.js';
import { ORDER_STATES } from './order-history.constants.js';
import { EntryDocument } from './schemas/entry-document.schema.js';

export class OrderHistoryEntryRecord {
  private constructor(private readonly row: OrderHistoryTable) {}

  public static fromRow(row: OrderHistoryTable): OrderHistoryEntryRecord {
    return new OrderHistoryEntryRecord(row);
  }

  public static from(entry: OrderHistoryEntry): OrderHistoryEntryRecord {
    const payloads = new LineItemPayloads();
    const document: EntryDocument = {
      restaurantId: entry.restaurantId.toString(),
      restaurantName: entry.restaurantName,
      lineItems: payloads.fromLineItems(entry.lineItems),
      orderTotal: payloads.fromMoney(entry.orderTotal),
    };
    return new OrderHistoryEntryRecord({
      orderId: entry.id.toString(),
      consumerId: entry.consumerId.toString(),
      state: entry.state,
      createdAt: entry.createdAt,
      keywords: [...entry.keywords.toArray()],
      document,
      updatedAt: entry.updatedAt,
      version: entry.version,
    });
  }

  public toEntry(): OrderHistoryEntry {
    const { row } = this;
    const payloads = new LineItemPayloads();
    const document = this.document();
    return OrderHistoryEntry.restore({
      id: OrderId.of(row.orderId),
      consumerId: ConsumerId.of(row.consumerId),
      restaurantId: RestaurantId.of(document.restaurantId),
      restaurantName: document.restaurantName,
      lineItems: payloads.toLineItems(document.lineItems),
      orderTotal: payloads.toMoney(document.orderTotal),
      state: this.state(),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      version: row.version,
    });
  }

  public entryRow(): OrderHistoryTable {
    return { ...this.row };
  }

  private document(): EntryDocument {
    const { document, orderId } = this.row;
    if (Value.Check(EntryDocument, document)) {
      return document;
    }
    throw new CompiledSchema(EntryDocument).rejectionOf(
      document,
      'order_history.invalid_entry',
      `The stored history entry of order ${orderId} does not match its schema.`,
    );
  }

  private state(): OrderState {
    const state = ORDER_STATES.get(this.row.state);
    if (state === undefined) {
      throw new InvalidInput(
        'order_history.unknown_state',
        `Unknown order history state "${this.row.state}".`,
      );
    }
    return state;
  }
}
