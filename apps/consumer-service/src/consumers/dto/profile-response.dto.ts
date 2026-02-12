import type { Consumer } from '../entities/consumer.entity.js';

export class ProfileResponse {
  public readonly id: string;
  public readonly email: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly phoneNumber: string | null;
  public readonly registeredAt: string;
  public readonly updatedAt: string;

  public constructor(consumer: Consumer) {
    this.id = consumer.id.toString();
    this.email = consumer.email.toString();
    this.firstName = consumer.name.firstName;
    this.lastName = consumer.name.lastName;
    this.phoneNumber = consumer.phoneNumber?.toString() ?? null;
    this.registeredAt = consumer.registeredAt.toISOString();
    this.updatedAt = consumer.updatedAt.toISOString();
  }
}
