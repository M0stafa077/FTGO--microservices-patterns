import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import { Uuid, REDACTED } from '@ftgo/common';

import {
  REFRESH_TOKEN_SECRET_BYTES,
  REFRESH_TOKEN_SECRET_FORMAT,
  REFRESH_TOKEN_SEPARATOR,
} from '../auth.constants.js';
import { InvalidRefreshToken } from '../errors/invalid-refresh-token.js';

import { SessionId } from './session-id.js';

export class RefreshToken {
  private constructor(
    public readonly sessionId: SessionId,
    private readonly secret: string,
  ) {}

  public static issueFor(sessionId: SessionId): RefreshToken {
    return new RefreshToken(
      sessionId,
      randomBytes(REFRESH_TOKEN_SECRET_BYTES).toString('base64url'),
    );
  }

  public static parse(value: string): RefreshToken {
    const [sessionId, secret, ...rest] = value.split(REFRESH_TOKEN_SEPARATOR);
    const isWellFormed =
      sessionId !== undefined &&
      secret !== undefined &&
      rest.length === 0 &&
      Uuid.isValid(sessionId) &&
      REFRESH_TOKEN_SECRET_FORMAT.test(secret);
    if (!isWellFormed) {
      throw new InvalidRefreshToken();
    }
    return new RefreshToken(SessionId.of(sessionId), secret);
  }

  public hash(): string {
    return createHash('sha256').update(this.secret).digest('hex');
  }

  public matches(storedHash: string): boolean {
    const presented = Buffer.from(this.hash(), 'hex');
    const stored = Buffer.from(storedHash, 'hex');
    return presented.length === stored.length && timingSafeEqual(presented, stored);
  }

  public reveal(): string {
    return `${this.sessionId.toString()}${REFRESH_TOKEN_SEPARATOR}${this.secret}`;
  }

  public toString(): string {
    return REDACTED;
  }

  public toJSON(): string {
    return REDACTED;
  }
}
