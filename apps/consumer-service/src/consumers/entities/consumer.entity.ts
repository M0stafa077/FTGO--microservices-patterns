import { ConsumerId } from './consumer-id.js';
import type { ConsumerState } from './consumer-state.js';
import type { EmailAddress } from './email-address.js';
import type { PasswordHash } from './password-hash.js';
import type { PersonName } from './person-name.js';
import type { PhoneNumber } from './phone-number.js';
import type { Registration } from './registration.js';

export class Consumer {
  public readonly id: ConsumerId;
  public readonly email: EmailAddress;
  public readonly passwordHash: PasswordHash;
  public readonly registeredAt: Date;
  public readonly version: number;
  private currentName: PersonName;
  private currentPhoneNumber: PhoneNumber | undefined;
  private lastUpdatedAt: Date;

  private constructor(state: ConsumerState) {
    this.id = state.id;
    this.email = state.email;
    this.passwordHash = state.passwordHash;
    this.registeredAt = state.registeredAt;
    this.version = state.version;
    this.currentName = state.name;
    this.currentPhoneNumber = state.phoneNumber;
    this.lastUpdatedAt = state.updatedAt;
  }

  public get name(): PersonName {
    return this.currentName;
  }

  public get phoneNumber(): PhoneNumber | undefined {
    return this.currentPhoneNumber;
  }

  public get updatedAt(): Date {
    return this.lastUpdatedAt;
  }

  public static register(registration: Registration, now: Date): Consumer {
    return new Consumer({
      id: ConsumerId.generate(),
      email: registration.email,
      passwordHash: registration.passwordHash,
      name: registration.name,
      phoneNumber: registration.phoneNumber,
      registeredAt: now,
      updatedAt: now,
      version: 0,
    });
  }

  public static restore(state: ConsumerState): Consumer {
    return new Consumer(state);
  }

  public updateProfile(name: PersonName, phoneNumber: PhoneNumber | undefined, now: Date): void {
    this.currentName = name;
    this.currentPhoneNumber = phoneNumber;
    this.lastUpdatedAt = now;
  }
}
