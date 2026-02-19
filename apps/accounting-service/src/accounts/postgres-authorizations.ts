import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { AccountingDatabase } from '../database/accounting-database.js';

import { AuthorizationRecord } from './authorization.record.js';
import type { Authorizations } from './authorizations.js';
import type { Authorization } from './entities/authorization.entity.js';
import type { OrderId } from './entities/order-id.js';

@Injectable()
export class PostgresAuthorizations implements Authorizations {
  public constructor(@Inject(AccountingDatabase) private readonly database: AccountingDatabase) {}

  public async findById(orderId: OrderId): Promise<Authorization | undefined> {
    try {
      const row = await this.database
        .current()
        .selectFrom('authorizations')
        .selectAll()
        .where('orderId', '=', orderId.toString())
        .executeTakeFirst();
      return row === undefined ? undefined : AuthorizationRecord.fromRow(row).toAuthorization();
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find authorization');
    }
  }

  public async add(authorization: Authorization): Promise<void> {
    try {
      await this.database
        .current()
        .insertInto('authorizations')
        .values(AuthorizationRecord.insertRowOf(authorization))
        .execute();
    } catch (error) {
      PostgresFailure.of(error).rethrow('add authorization');
    }
  }
}
