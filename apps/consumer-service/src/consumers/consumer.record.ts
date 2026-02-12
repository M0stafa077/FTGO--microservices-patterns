import type { ConsumersTable } from '../database/tables/consumers.table.js';

import { ConsumerId } from './entities/consumer-id.js';
import { Consumer } from './entities/consumer.entity.js';
import { EmailAddress } from './entities/email-address.js';
import { PasswordHash } from './entities/password-hash.js';
import { PersonName } from './entities/person-name.js';
import { PhoneNumber } from './entities/phone-number.js';

export class ConsumerRecord {
  private constructor(private readonly row: ConsumersTable) {}

  public static fromRow(row: ConsumersTable): ConsumerRecord {
    return new ConsumerRecord(row);
  }

  public static from(consumer: Consumer): ConsumerRecord {
    return new ConsumerRecord({
      id: consumer.id.toString(),
      email: consumer.email.toString(),
      passwordHash: consumer.passwordHash.reveal(),
      firstName: consumer.name.firstName,
      lastName: consumer.name.lastName,
      phoneNumber: consumer.phoneNumber?.toString() ?? null,
      registeredAt: consumer.registeredAt,
      updatedAt: consumer.updatedAt,
      version: consumer.version,
    });
  }

  public toConsumer(): Consumer {
    return Consumer.restore({
      id: ConsumerId.of(this.row.id),
      email: EmailAddress.of(this.row.email),
      passwordHash: PasswordHash.of(this.row.passwordHash),
      name: PersonName.of(this.row.firstName, this.row.lastName),
      phoneNumber: this.row.phoneNumber === null ? undefined : PhoneNumber.of(this.row.phoneNumber),
      registeredAt: this.row.registeredAt,
      updatedAt: this.row.updatedAt,
      version: this.row.version,
    });
  }

  public toRow(): ConsumersTable {
    return { ...this.row };
  }
}
