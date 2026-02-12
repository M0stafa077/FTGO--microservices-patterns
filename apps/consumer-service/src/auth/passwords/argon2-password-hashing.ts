import { randomBytes } from 'node:crypto';

import { hash, verify } from '@node-rs/argon2';

import { PasswordHash } from '../../consumers/entities/password-hash.js';
import type { Password } from '../../consumers/entities/password.js';
import { ARGON2_OPTIONS, DECOY_PASSWORD_BYTES } from '../auth.constants.js';

import type { PasswordHashing } from './password-hashing.js';

export class Argon2PasswordHashing implements PasswordHashing {
  private constructor(private readonly decoyHash: PasswordHash) {}

  public static async create(): Promise<Argon2PasswordHashing> {
    const decoy = await hash(
      randomBytes(DECOY_PASSWORD_BYTES).toString('base64url'),
      ARGON2_OPTIONS,
    );
    return new Argon2PasswordHashing(PasswordHash.of(decoy));
  }

  public async hash(password: Password): Promise<PasswordHash> {
    return PasswordHash.of(await hash(password.reveal(), ARGON2_OPTIONS));
  }

  public async verify(password: Password, storedHash: PasswordHash | undefined): Promise<boolean> {
    const isMatch = await verify((storedHash ?? this.decoyHash).reveal(), password.reveal());
    return storedHash !== undefined && isMatch;
  }
}
