import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type CreateTableBuilder, type Kysely } from 'kysely';

export class CreateDeliveries implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('deliveries')
      .addColumn('id', 'uuid', (column) => column.primaryKey())
      .addColumn('consumer_id', 'uuid', (column) => column.notNull())
      .addColumn('restaurant_id', 'uuid', (column) => column.notNull().references('restaurants.id'))
      .addColumn('state', 'text', (column) => column.notNull())
      .$call((table) => this.withAddress(table, 'pickup'))
      .$call((table) => this.withAddress(table, 'delivery'))
      .addColumn('pickup_time', 'timestamptz')
      .addColumn('delivery_time', 'timestamptz')
      .addColumn('courier_id', 'uuid', (column) => column.references('couriers.id'))
      .addColumn('created_at', 'timestamptz', (column) => column.notNull())
      .addColumn('updated_at', 'timestamptz', (column) => column.notNull())
      .addColumn('version', 'integer', (column) => column.notNull().defaultTo(0))
      .$call((table) => this.withChecks(table))
      .execute();
    await this.addIndexes(database);
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('deliveries').execute();
  }

  private withAddress(
    table: CreateTableBuilder<string>,
    prefix: string,
  ): CreateTableBuilder<string> {
    return table
      .addColumn(`${prefix}_street1`, 'text', (column) => column.notNull())
      .addColumn(`${prefix}_street2`, 'text')
      .addColumn(`${prefix}_city`, 'text', (column) => column.notNull())
      .addColumn(`${prefix}_state`, 'text', (column) => column.notNull())
      .addColumn(`${prefix}_zip`, 'text', (column) => column.notNull());
  }

  private withChecks(table: CreateTableBuilder<string>): CreateTableBuilder<string> {
    return table
      .addCheckConstraint(
        'deliveries_state_check',
        sql`state in ('PENDING', 'SCHEDULED', 'CANCELLED')`,
      )
      .addCheckConstraint(
        'deliveries_schedule_check',
        sql`(state = 'SCHEDULED') = (pickup_time is not null)
          and (pickup_time is null) = (delivery_time is null)
          and (pickup_time is null) = (courier_id is null)`,
      );
  }

  private async addIndexes(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createIndex('deliveries_scheduled_courier_id_idx')
      .on('deliveries')
      .column('courier_id')
      .where(sql.ref('state'), '=', 'SCHEDULED')
      .execute();
    await database.schema
      .createIndex('deliveries_consumer_id_idx')
      .on('deliveries')
      .column('consumer_id')
      .execute();
  }
}
