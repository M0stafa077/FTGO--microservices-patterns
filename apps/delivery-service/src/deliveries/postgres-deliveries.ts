import { ConcurrentModification } from '@ftgo/common';
import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { DeliveryDatabase } from '../database/delivery-database.js';
import type { DeliveriesTable } from '../database/tables/deliveries.table.js';

import type { Deliveries } from './deliveries.js';
import { DeliveryRecord } from './delivery.record.js';
import type { DeliveryId } from './entities/delivery-id.js';
import type { Delivery } from './entities/delivery.entity.js';
import { DeliveryNotFound } from './errors/delivery-not-found.js';

@Injectable()
export class PostgresDeliveries implements Deliveries {
  public constructor(@Inject(DeliveryDatabase) private readonly database: DeliveryDatabase) {}

  public async findById(id: DeliveryId): Promise<Delivery | undefined> {
    try {
      const row = await this.database
        .current()
        .selectFrom('deliveries')
        .selectAll()
        .where('id', '=', id.toString())
        .executeTakeFirst();
      return row === undefined ? undefined : DeliveryRecord.fromRow(row).toDelivery();
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find delivery');
    }
  }

  public async getById(id: DeliveryId): Promise<Delivery> {
    const delivery = await this.findById(id);
    if (delivery === undefined) {
      throw new DeliveryNotFound(id);
    }
    return delivery;
  }

  public async add(delivery: Delivery): Promise<void> {
    try {
      await this.database
        .current()
        .insertInto('deliveries')
        .values(DeliveryRecord.from(delivery).deliveryRow())
        .execute();
    } catch (error) {
      PostgresFailure.of(error).rethrow('add delivery');
    }
  }

  public async update(delivery: Delivery): Promise<void> {
    const row = DeliveryRecord.from(delivery).deliveryRow();
    if ((await this.updateRow(row)) === 0n) {
      throw new ConcurrentModification('Delivery', row.id);
    }
  }

  private async updateRow(row: DeliveriesTable): Promise<bigint> {
    try {
      const result = await this.database
        .current()
        .updateTable('deliveries')
        .set({
          state: row.state,
          pickupTime: row.pickupTime,
          deliveryTime: row.deliveryTime,
          courierId: row.courierId,
          updatedAt: row.updatedAt,
          version: row.version + 1,
        })
        .where('id', '=', row.id)
        .where('version', '=', row.version)
        .executeTakeFirst();
      return result.numUpdatedRows;
    } catch (error) {
      return PostgresFailure.of(error).rethrow('update delivery');
    }
  }
}
