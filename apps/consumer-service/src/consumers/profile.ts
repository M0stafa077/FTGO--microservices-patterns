import type { PersonName } from './entities/person-name.js';
import type { PhoneNumber } from './entities/phone-number.js';

export interface Profile {
  readonly name: PersonName;
  readonly phoneNumber: PhoneNumber | undefined;
}
