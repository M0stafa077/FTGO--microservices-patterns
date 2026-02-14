import { createRemoteJWKSet, errors, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from 'jose';

import { ROLES } from '../../common.constants.js';
import type { FtgoError } from '../../errors/ftgo-error.js';
import { ServiceUnavailable } from '../../errors/service-unavailable.js';
import { Uuid } from '../../identity/uuid.js';
import {
  ACCESS_TOKEN_ALGORITHM,
  ACCESS_TOKEN_CLOCK_TOLERANCE_SECONDS,
  ACCESS_TOKEN_TYPE,
  JWKS_TIMEOUT_MS,
  ROLE_CLAIM,
  TOKEN_REJECTION_CODES,
} from '../infrastructure.constants.js';

import type { AccessConfig } from './access.config.js';
import { Caller } from './caller.js';
import { InvalidAccessToken } from './errors/invalid-access-token.js';

export class RemoteAccessTokens {
  private readonly keys: JWTVerifyGetKey;

  public constructor(private readonly config: AccessConfig) {
    this.keys = createRemoteJWKSet(config.jwksUrl, { timeoutDuration: JWKS_TIMEOUT_MS });
  }

  public async verify(token: string): Promise<Caller> {
    return this.callerOf(await this.payloadOf(token));
  }

  private async payloadOf(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, this.keys, {
        algorithms: [ACCESS_TOKEN_ALGORITHM],
        typ: ACCESS_TOKEN_TYPE,
        issuer: this.config.issuer,
        audience: this.config.audience,
        clockTolerance: ACCESS_TOKEN_CLOCK_TOLERANCE_SECONDS,
        requiredClaims: ['sub', 'exp', 'iat', ROLE_CLAIM],
      });
      return payload;
    } catch (error) {
      throw this.failureOf(error);
    }
  }

  private failureOf(error: unknown): FtgoError {
    if (error instanceof errors.JOSEError && TOKEN_REJECTION_CODES.has(error.code)) {
      return new InvalidAccessToken({ cause: error });
    }
    return new ServiceUnavailable(
      'auth.keys_unavailable',
      'The access token signing keys cannot be loaded.',
      { cause: error },
    );
  }

  private callerOf(payload: JWTPayload): Caller {
    const subject = payload.sub;
    const claimedRole = payload[ROLE_CLAIM];
    const role = typeof claimedRole === 'string' ? ROLES.get(claimedRole) : undefined;
    if (typeof subject !== 'string' || !Uuid.isValid(subject) || role === undefined) {
      throw new InvalidAccessToken();
    }
    return new Caller(Uuid.of(subject), role);
  }
}
