import { AuthorizationNotFound } from '../errors/authorization-not-found.js';

import type { AccountAuthorized } from './account-authorized.js';
import type { AccountEventTranslation } from './account-event-translation.js';
import type { AuthorizationReversed } from './authorization-reversed.js';
import type { AuthorizationRevised } from './authorization-revised.js';
import { Authorization } from './authorization.js';
import type { OrderId } from './order-id.js';

export class AuthorizationLedger implements AccountEventTranslation<void> {
  private readonly authorizations = new Map<string, Authorization>();

  public find(orderId: OrderId): Authorization | undefined {
    return this.authorizations.get(orderId.toString());
  }

  public get(orderId: OrderId): Authorization {
    const authorization = this.find(orderId);
    if (authorization === undefined) {
      throw new AuthorizationNotFound(orderId);
    }
    return authorization;
  }

  public accountAuthorized(event: AccountAuthorized): void {
    this.keep(Authorization.granted(event.orderId, event.amount));
  }

  public authorizationReversed(event: AuthorizationReversed): void {
    this.keep(this.get(event.orderId).reversed());
  }

  public authorizationRevised(event: AuthorizationRevised): void {
    this.keep(this.get(event.orderId).revisedTo(event.amount));
  }

  private keep(authorization: Authorization): void {
    this.authorizations.set(authorization.orderId.toString(), authorization);
  }
}
