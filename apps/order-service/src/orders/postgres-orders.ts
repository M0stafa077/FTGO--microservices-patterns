import { ConcurrentModification } from '@ftgo/common';
import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { OrderDatabase } from '../database/order-database.js';
import type { OrdersTable } from '../database/tables/orders.table.js';

import type { OrderId } from './entities/order-id.js';
import type { Order } from './entities/order.entity.js';
import { OrderNotFound } from './errors/order-not-found.js';
import { OrderRecord } from './order.record.js';
import type { Orders } from './orders.js';

@Injectable()
export class PostgresOrders implements Orders {
  public constructor(@Inject(OrderDatabase) private readonly database: OrderDatabase) {}

  public async findById(id: OrderId): Promise<Order | undefined> {
    return (await this.findRecord(id))?.toOrder();
  }

  public async getById(id: OrderId): Promise<Order> {
    const order = await this.findById(id);
    if (order === undefined) {
      throw new OrderNotFound(id);
    }
    return order;
  }

  public async add(order: Order): Promise<void> {
    const record = OrderRecord.from(order);
    try {
      const database = this.database.current();
      await database.insertInto('orders').values(record.orderRow()).execute();
      await database.insertInto('orderLineItems').values(record.lineItemRows()).execute();
    } catch (error) {
      PostgresFailure.of(error).rethrow('add order');
    }
  }

  public async update(order: Order): Promise<void> {
    const row = OrderRecord.from(order).orderRow();
    if ((await this.updateRow(row)) === 0n) {
      throw new ConcurrentModification('Order', row.id);
    }
  }

  private async findRecord(id: OrderId): Promise<OrderRecord | undefined> {
    try {
      const database = this.database.current();
      const row = await database
        .selectFrom('orders')
        .selectAll()
        .where('id', '=', id.toString())
        .executeTakeFirst();
      if (row === undefined) {
        return undefined;
      }
      const lineItems = await database
        .selectFrom('orderLineItems')
        .selectAll()
        .where('orderId', '=', row.id)
        .orderBy('position')
        .execute();
      return OrderRecord.fromRows(row, lineItems);
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find order');
    }
  }

  private async updateRow(row: OrdersTable): Promise<bigint> {
    try {
      const result = await this.database
        .current()
        .updateTable('orders')
        .set({ state: row.state, updatedAt: row.updatedAt, version: row.version + 1 })
        .where('id', '=', row.id)
        .where('version', '=', row.version)
        .executeTakeFirst();
      return result.numUpdatedRows;
    } catch (error) {
      return PostgresFailure.of(error).rethrow('update order');
    }
  }
}
