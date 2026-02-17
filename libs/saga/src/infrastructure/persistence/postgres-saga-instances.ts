import { ConcurrentModification } from '@ftgo/common';
import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';
import type { Insertable, Selectable } from 'kysely';

import { SagaNotFound } from '../../errors/saga-not-found.js';
import type { SagaInstance } from '../../saga-instance.js';

import { SagaDatabase } from './saga-database.js';
import { SagaInstanceRecord } from './saga-instance.record.js';
import type { SagaInstances } from './saga-instances.js';
import type { SagaInstancesTable } from './tables/saga-instances.table.js';

@Injectable()
export class PostgresSagaInstances implements SagaInstances {
  public constructor(@Inject(SagaDatabase) private readonly database: SagaDatabase) {}

  public async getById(id: string): Promise<SagaInstance> {
    const row = await this.findRow(id);
    if (row === undefined) {
      throw new SagaNotFound(id);
    }
    return SagaInstanceRecord.fromRow(row).toInstance();
  }

  public async add(instance: SagaInstance): Promise<void> {
    try {
      await this.database
        .current()
        .insertInto('sagaInstances')
        .values(SagaInstanceRecord.rowOf(instance))
        .execute();
    } catch (error) {
      PostgresFailure.of(error).rethrow('add saga instance');
    }
  }

  public async update(instance: SagaInstance): Promise<void> {
    const { version, ...row } = SagaInstanceRecord.rowOf(instance);
    if ((await this.updateRow(row, version)) === 0n) {
      throw new ConcurrentModification('Saga', row.id);
    }
  }

  private async findRow(id: string): Promise<Selectable<SagaInstancesTable> | undefined> {
    try {
      return await this.database
        .current()
        .selectFrom('sagaInstances')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find saga instance');
    }
  }

  private async updateRow(
    row: Omit<Insertable<SagaInstancesTable>, 'version'>,
    version: number,
  ): Promise<bigint> {
    try {
      const result = await this.database
        .current()
        .updateTable('sagaInstances')
        .set({ ...row, version: version + 1 })
        .where('id', '=', row.id)
        .where('version', '=', version)
        .executeTakeFirst();
      return result.numUpdatedRows;
    } catch (error) {
      return PostgresFailure.of(error).rethrow('update saga instance');
    }
  }
}
