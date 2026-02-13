import { ConcurrentModification } from '@ftgo/common';
import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { ConsumerDatabase } from '../database/consumer-database.js';
import type { ConsumersTable } from '../database/tables/consumers.table.js';

import { ConsumerRecord } from './consumer.record.js';
import { CONSUMERS_EMAIL_CONSTRAINT } from './consumers.constants.js';
import type { Consumers } from './consumers.js';
import type { ConsumerId } from './entities/consumer-id.js';
import type { Consumer } from './entities/consumer.entity.js';
import type { EmailAddress } from './entities/email-address.js';
import { ConsumerNotFound } from './errors/consumer-not-found.js';
import { EmailAlreadyRegistered } from './errors/email-already-registered.js';

@Injectable()
export class PostgresConsumers implements Consumers {
  public constructor(@Inject(ConsumerDatabase) private readonly database: ConsumerDatabase) {}

  public async findByEmail(email: EmailAddress): Promise<Consumer | undefined> {
    try {
      const row = await this.database
        .current()
        .selectFrom('consumers')
        .selectAll()
        .where('email', '=', email.toString())
        .executeTakeFirst();
      return row === undefined ? undefined : ConsumerRecord.fromRow(row).toConsumer();
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find consumer by email');
    }
  }

  public async getById(id: ConsumerId): Promise<Consumer> {
    const consumer = await this.findById(id);
    if (consumer === undefined) {
      throw new ConsumerNotFound(id);
    }
    return consumer;
  }

  public async add(consumer: Consumer): Promise<void> {
    try {
      await this.database
        .current()
        .insertInto('consumers')
        .values(ConsumerRecord.from(consumer).toRow())
        .execute();
    } catch (error) {
      const failure = PostgresFailure.of(error);
      if (failure.isUniqueViolationOf(CONSUMERS_EMAIL_CONSTRAINT)) {
        throw new EmailAlreadyRegistered();
      }
      failure.rethrow('add consumer');
    }
  }

  public async update(consumer: Consumer): Promise<void> {
    const row = ConsumerRecord.from(consumer).toRow();
    const updatedRows = await this.updateRow(row);
    if (updatedRows === 0n) {
      throw new ConcurrentModification('Consumer', row.id);
    }
  }

  private async findById(id: ConsumerId): Promise<Consumer | undefined> {
    try {
      const row = await this.database
        .current()
        .selectFrom('consumers')
        .selectAll()
        .where('id', '=', id.toString())
        .executeTakeFirst();
      return row === undefined ? undefined : ConsumerRecord.fromRow(row).toConsumer();
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find consumer by id');
    }
  }

  private async updateRow(row: ConsumersTable): Promise<bigint> {
    try {
      const result = await this.database
        .current()
        .updateTable('consumers')
        .set({
          firstName: row.firstName,
          lastName: row.lastName,
          phoneNumber: row.phoneNumber,
          updatedAt: row.updatedAt,
          version: row.version + 1,
        })
        .where('id', '=', row.id)
        .where('version', '=', row.version)
        .executeTakeFirst();
      return result.numUpdatedRows;
    } catch (error) {
      return PostgresFailure.of(error).rethrow('update consumer');
    }
  }
}
