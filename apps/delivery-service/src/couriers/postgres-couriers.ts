import { ConcurrentModification } from '@ftgo/common';
import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { DeliveryDatabase } from '../database/delivery-database.js';
import type { CouriersTable } from '../database/tables/couriers.table.js';

import { CourierRecord } from './courier.record.js';
import type { Couriers } from './couriers.js';
import type { CourierId } from './entities/courier-id.js';
import type { Courier } from './entities/courier.entity.js';
import { CourierNotFound } from './errors/courier-not-found.js';

@Injectable()
export class PostgresCouriers implements Couriers {
  public constructor(@Inject(DeliveryDatabase) private readonly database: DeliveryDatabase) {}

  public async findById(id: CourierId): Promise<Courier | undefined> {
    try {
      const row = await this.database
        .current()
        .selectFrom('couriers')
        .selectAll()
        .where('id', '=', id.toString())
        .executeTakeFirst();
      return row === undefined ? undefined : CourierRecord.fromRow(row).toCourier();
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find courier');
    }
  }

  public async getById(id: CourierId): Promise<Courier> {
    const courier = await this.findById(id);
    if (courier === undefined) {
      throw new CourierNotFound(id);
    }
    return courier;
  }

  public async addIfAbsent(courier: Courier): Promise<void> {
    try {
      await this.database
        .current()
        .insertInto('couriers')
        .values(CourierRecord.from(courier).courierRow())
        .onConflict((conflict) => conflict.column('id').doNothing())
        .execute();
    } catch (error) {
      PostgresFailure.of(error).rethrow('add courier');
    }
  }

  public async update(courier: Courier): Promise<void> {
    const row = CourierRecord.from(courier).courierRow();
    if ((await this.updateRow(row)) === 0n) {
      throw new ConcurrentModification('Courier', row.id);
    }
  }

  private async updateRow(row: CouriersTable): Promise<bigint> {
    try {
      const result = await this.database
        .current()
        .updateTable('couriers')
        .set({ available: row.available, updatedAt: row.updatedAt, version: row.version + 1 })
        .where('id', '=', row.id)
        .where('version', '=', row.version)
        .executeTakeFirst();
      return result.numUpdatedRows;
    } catch (error) {
      return PostgresFailure.of(error).rethrow('update courier');
    }
  }
}
