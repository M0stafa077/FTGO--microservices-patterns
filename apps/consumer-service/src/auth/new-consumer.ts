import type { EmailAddress } from '../consumers/entities/email-address.js';
import type { Password } from '../consumers/entities/password.js';
import type { PersonName } from '../consumers/entities/person-name.js';
import type { PhoneNumber } from '../consumers/entities/phone-number.js';

export interface NewConsumer {
  readonly email: EmailAddress;
  readonly password: Password;
  readonly name: PersonName;
  readonly phoneNumber: PhoneNumber | undefined;
}
