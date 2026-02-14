import type { Role } from '../../identity/role.js';
import type { Uuid } from '../../identity/uuid.js';

export class Caller {
  public constructor(
    public readonly accountId: Uuid,
    public readonly role: Role,
  ) {}
}
