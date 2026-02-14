import { Forbidden } from '../../../errors/forbidden.js';
import type { Role } from '../../../identity/role.js';

export class MissingRole extends Forbidden {
  public constructor(role: Role) {
    super('auth.missing_role', `This operation requires the ${role} role.`);
  }
}
