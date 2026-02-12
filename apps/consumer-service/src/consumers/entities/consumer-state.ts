import type { ConsumerId } from './consumer-id.js';
import type { EmailAddress } from './email-address.js';
import type { PasswordHash } from './password-hash.js';
import type { PersonName } from './person-name.js';
import type { PhoneNumber } from './phone-number.js';

export interface ConsumerState {
  readonly id: ConsumerId;
  readonly email: EmailAddress;
  readonly passwordHash: PasswordHash;
  readonly name: PersonName;
  readonly phoneNumber: PhoneNumber | undefined;
  readonly registeredAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}
