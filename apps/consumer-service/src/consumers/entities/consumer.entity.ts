import { ConsumerId } from './consumer-id.js';
import { ConsumerRegistered } from './consumer-registered.js';
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
  private readonly pendingEvents: ConsumerRegistered[] = [];

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
    const consumer = new Consumer({
      id: ConsumerId.generate(),
      email: registration.email,
      passwordHash: registration.passwordHash,
      name: registration.name,
      phoneNumber: registration.phoneNumber,
      registeredAt: now,
      updatedAt: now,
      version: 0,
    });
    consumer.pendingEvents.push(new ConsumerRegistered(consumer.id, consumer.name));
    return consumer;
  }

  public static restore(state: ConsumerState): Consumer {
    return new Consumer(state);
  }

  public releaseEvents(): ReadonlyArray<ConsumerRegistered> {
    return this.pendingEvents.splice(0);
  }

  public updateProfile(name: PersonName, phoneNumber: PhoneNumber | undefined, now: Date): void {
    this.currentName = name;
    this.currentPhoneNumber = phoneNumber;
    this.lastUpdatedAt = now;
  }
}
