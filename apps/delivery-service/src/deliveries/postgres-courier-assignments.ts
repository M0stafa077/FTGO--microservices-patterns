import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { CourierId } from '../couriers/entities/courier-id.js';
import { DeliveryDatabase } from '../database/delivery-database.js';

import type { CourierAssignments } from './courier-assignments.js';
import { DeliveryState } from './entities/delivery-state.js';

@Injectable()
export class PostgresCourierAssignments implements CourierAssignments {
  public constructor(@Inject(DeliveryDatabase) private readonly database: DeliveryDatabase) {}

  public async leastBusy(): Promise<CourierId | undefined> {
    try {
      const row = await this.database
        .current()
        .selectFrom('couriers')
        .leftJoin('deliveries', (join) =>
          join
            .onRef('deliveries.courierId', '=', 'couriers.id')
            .on('deliveries.state', '=', DeliveryState.Scheduled),
        )
        .select('couriers.id')
        .where('couriers.available', '=', true)
        .groupBy('couriers.id')
        .orderBy((expression) => expression.fn.count('deliveries.id'))
        .orderBy('couriers.id')
        .limit(1)
        .executeTakeFirst();
      return row === undefined ? undefined : CourierId.of(row.id);
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find least busy courier');
    }
  }
}
