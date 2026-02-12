import type { PasswordHash } from '../../consumers/entities/password-hash.js';
import type { Password } from '../../consumers/entities/password.js';

export interface PasswordHashing {
  hash(password: Password): Promise<PasswordHash>;

  verify(password: Password, hash: PasswordHash | undefined): Promise<boolean>;
}
export const PasswordHashing = Symbol('PasswordHashing');
