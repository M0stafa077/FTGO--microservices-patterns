import { ConcurrentModification } from '@ftgo/common';
import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';
import { sql, type Selectable, type SelectQueryBuilder } from 'kysely';

import { OrderHistoryDatabase } from '../database/order-history-database.js';
import type { OrderHistoryTables } from '../database/order-history-tables.js';
import type { OrderHistoryTable } from '../database/tables/order-history.table.js';

import type { OrderHistoryEntry } from './entities/order-history-entry.entity.js';
import type { OrderId } from './entities/order-id.js';
import { EntryNotFound } from './errors/entry-not-found.js';
import type { HistoryCriteria } from './history-criteria.js';
import { HistoryPage } from './history-page.js';
import { OrderHistoryEntryRecord } from './order-history-entry.record.js';
import type { OrderHistory } from './order-history.js';
import { PagePosition } from './page-position.js';

type HistoryQuery = SelectQueryBuilder<
  OrderHistoryTables,
  'orderHistory',
  Selectable<OrderHistoryTable>
>;

@Injectable()
export class PostgresOrderHistory implements OrderHistory {
  public constructor(
    @Inject(OrderHistoryDatabase) private readonly database: OrderHistoryDatabase,
  ) {}

  public async getById(id: OrderId): Promise<OrderHistoryEntry> {
    const row = await this.findRow(id);
    if (row === undefined) {
      throw new EntryNotFound(id);
    }
    return OrderHistoryEntryRecord.fromRow(row).toEntry();
  }

  public async add(entry: OrderHistoryEntry): Promise<void> {
    try {
      await this.database
        .current()
        .insertInto('orderHistory')
        .values(OrderHistoryEntryRecord.from(entry).entryRow())
        .onConflict((conflict) => conflict.column('orderId').doNothing())
        .execute();
    } catch (error) {
      PostgresFailure.of(error).rethrow('add order history entry');
    }
  }

  public async update(entry: OrderHistoryEntry): Promise<void> {
    const row = OrderHistoryEntryRecord.from(entry).entryRow();
    if ((await this.updateRow(row)) === 0n) {
      throw new ConcurrentModification('OrderHistoryEntry', row.orderId);
    }
  }

  public async search(criteria: HistoryCriteria): Promise<HistoryPage> {
    const rows = await this.searchRows(criteria);
    const entries = rows
      .slice(0, criteria.pageSize)
      .map((row) => OrderHistoryEntryRecord.fromRow(row).toEntry());
    const last = entries.at(-1);
    const hasNext = rows.length > criteria.pageSize && last !== undefined;
    return new HistoryPage(entries, hasNext ? PagePosition.of(last.createdAt, last.id) : undefined);
  }

  private async findRow(id: OrderId): Promise<OrderHistoryTable | undefined> {
    try {
      return await this.database
        .current()
        .selectFrom('orderHistory')
        .selectAll()
        .where('orderId', '=', id.toString())
        .executeTakeFirst();
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find order history entry');
    }
  }

  private async searchRows(criteria: HistoryCriteria): Promise<OrderHistoryTable[]> {
    try {
      return await this.matching(criteria)
        .orderBy('createdAt', 'desc')
        .orderBy('orderId', 'desc')
        .limit(criteria.pageSize + 1)
        .execute();
    } catch (error) {
      return PostgresFailure.of(error).rethrow('search order history');
    }
  }

  private matching(criteria: HistoryCriteria): HistoryQuery {
    const { state, keywords, since, after } = criteria;
    let query = this.database
      .current()
      .selectFrom('orderHistory')
      .selectAll()
      .where('consumerId', '=', criteria.consumerId.toString());
    if (state !== undefined) {
      query = query.where('state', '=', state);
    }
    if (keywords !== undefined) {
      query = query.where('keywords', '@>', sql.val([...keywords.toArray()]));
    }
    if (since !== undefined) {
      query = query.where('createdAt', '>=', since);
    }
    if (after !== undefined) {
      query = this.after(query, after);
    }
    return query;
  }

  private after(query: HistoryQuery, position: PagePosition): HistoryQuery {
    return query.where((eb) =>
      eb(
        eb.refTuple('createdAt', 'orderId'),
        '<',
        eb.tuple(position.createdAt, position.orderId.toString()),
      ),
    );
  }

  private async updateRow(row: OrderHistoryTable): Promise<bigint> {
    try {
      const result = await this.database
        .current()
        .updateTable('orderHistory')
        .set({
          state: row.state,
          keywords: row.keywords,
          document: row.document,
          updatedAt: row.updatedAt,
          version: row.version + 1,
        })
        .where('orderId', '=', row.orderId)
        .where('version', '=', row.version)
        .executeTakeFirst();
      return result.numUpdatedRows;
    } catch (error) {
      return PostgresFailure.of(error).rethrow('update order history entry');
    }
  }
}
