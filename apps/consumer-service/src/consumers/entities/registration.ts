import type { EmailAddress } from './email-address.js';
import type { PasswordHash } from './password-hash.js';
import type { PersonName } from './person-name.js';
import type { PhoneNumber } from './phone-number.js';

export interface Registration {
  readonly email: EmailAddress;
  readonly passwordHash: PasswordHash;
  readonly name: PersonName;
  readonly phoneNumber: PhoneNumber | undefined;
}
