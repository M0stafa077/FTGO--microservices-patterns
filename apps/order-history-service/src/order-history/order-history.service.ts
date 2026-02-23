import { Clock, Role, Transactions, type Money } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import type { ConsumerId } from './entities/consumer-id.js';
import type { HistoryLineItem } from './entities/history-line-item.js';
import { OrderHistoryEntry } from './entities/order-history-entry.entity.js';
import type { OrderId } from './entities/order-id.js';
import type { PlacedOrder } from './entities/placed-order.js';
import { HistoryNotOwned } from './errors/history-not-owned.js';
import type { HistoryCriteria } from './history-criteria.js';
import type { HistoryPage } from './history-page.js';
import { OrderHistory } from './order-history.js';

@Injectable()
export class OrderHistoryService {
  public constructor(
    @Inject(OrderHistory) private readonly orderHistory: OrderHistory,
    @Inject(Transactions) private readonly transactions: Transactions,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async recordOrder(order: PlacedOrder): Promise<void> {
    await this.transactions.run(async () => {
      await this.orderHistory.add(OrderHistoryEntry.record(order, this.clock.now()));
    });
  }

  public async authorizeOrder(id: OrderId): Promise<void> {
    await this.change(id, (entry, now) => {
      entry.authorize(now);
    });
  }

  public async rejectOrder(id: OrderId): Promise<void> {
    await this.change(id, (entry, now) => {
      entry.reject(now);
    });
  }

  public async cancelOrder(id: OrderId): Promise<void> {
    await this.change(id, (entry, now) => {
      entry.cancel(now);
    });
  }

  public async reviseOrder(
    id: OrderId,
    lineItems: ReadonlyArray<HistoryLineItem>,
    orderTotal: Money,
  ): Promise<void> {
    await this.change(id, (entry, now) => {
      entry.revise(lineItems, orderTotal, now);
    });
  }

  public async findOrders(
    criteria: HistoryCriteria,
    reader: ConsumerId,
    readerRole: Role,
  ): Promise<HistoryPage> {
    if (readerRole !== Role.Admin && !criteria.consumerId.equals(reader)) {
      throw new HistoryNotOwned(criteria.consumerId);
    }
    return this.orderHistory.search(criteria);
  }

  private async change(
    id: OrderId,
    operation: (entry: OrderHistoryEntry, now: Date) => void,
  ): Promise<void> {
    await this.transactions.run(async () => {
      const entry = await this.orderHistory.getById(id);
      operation(entry, this.clock.now());
      await this.orderHistory.update(entry);
    });
  }
}
