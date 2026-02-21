import type { CouriersTable } from '../database/tables/couriers.table.js';

import { CourierId } from './entities/courier-id.js';
import { Courier } from './entities/courier.entity.js';

export class CourierRecord {
  private constructor(private readonly row: CouriersTable) {}

  public static fromRow(row: CouriersTable): CourierRecord {
    return new CourierRecord(row);
  }

  public static from(courier: Courier): CourierRecord {
    return new CourierRecord({
      id: courier.id.toString(),
      available: courier.isAvailable,
      createdAt: courier.createdAt,
      updatedAt: courier.updatedAt,
      version: courier.version,
    });
  }

  public toCourier(): Courier {
    return Courier.restore({
      id: CourierId.of(this.row.id),
      isAvailable: this.row.available,
      createdAt: this.row.createdAt,
      updatedAt: this.row.updatedAt,
      version: this.row.version,
    });
  }

  public courierRow(): CouriersTable {
    return { ...this.row };
  }
}
