import { randomUUID } from 'node:crypto';

import { ROLES, Uuid, type Clock } from '@ftgo/common';
import { errors, jwtVerify, SignJWT, type JWTPayload } from 'jose';

import type { TokenConfig } from '../../config/token.config.js';
import { ConsumerId } from '../../consumers/entities/consumer-id.js';
import {
  ACCESS_TOKEN_CLOCK_TOLERANCE_SECONDS,
  ACCESS_TOKEN_TYPE,
  ROLE_CLAIM,
  SESSION_CLAIM,
  SIGNING_ALGORITHM,
} from '../auth.constants.js';
import { SessionId } from '../entities/session-id.js';
import { InvalidAccessToken } from '../errors/invalid-access-token.js';
import { Principal } from '../principal.js';

import type { AccessToken } from './access-token.js';
import type { AccessTokens } from './access-tokens.js';
import { SigningKeys } from './signing-keys.js';

export class JwtAccessTokens implements AccessTokens {
  public constructor(
    private readonly keys: SigningKeys,
    private readonly config: TokenConfig,
    private readonly clock: Clock,
  ) {}

  public async issue(principal: Principal): Promise<AccessToken> {
    const issuedAt = this.clock.now();
    const expiresAt = this.config.accessTokenLifetime.addTo(issuedAt);
    const value = await new SignJWT({
      [SESSION_CLAIM]: principal.sessionId.toString(),
      [ROLE_CLAIM]: principal.role,
    })
      .setProtectedHeader({
        alg: SIGNING_ALGORITHM,
        kid: this.keys.keyId,
        typ: ACCESS_TOKEN_TYPE,
      })
      .setSubject(principal.consumerId.toString())
      .setIssuer(this.config.issuer)
      .setAudience(this.config.audience)
      .setIssuedAt(issuedAt)
      .setExpirationTime(expiresAt)
      .setJti(randomUUID())
      .sign(this.keys.privateKey);
    return { value, expiresAt };
  }

  public async verify(token: string): Promise<Principal> {
    try {
      const { payload } = await jwtVerify(token, this.keys.publicKey, {
        algorithms: [SIGNING_ALGORITHM],
        typ: ACCESS_TOKEN_TYPE,
        issuer: this.config.issuer,
        audience: this.config.audience,
        currentDate: this.clock.now(),
        clockTolerance: ACCESS_TOKEN_CLOCK_TOLERANCE_SECONDS,
        requiredClaims: ['sub', 'exp', 'iat', SESSION_CLAIM, ROLE_CLAIM],
      });
      return this.principalOf(payload);
    } catch (error) {
      if (error instanceof errors.JOSEError) {
        throw new InvalidAccessToken({ cause: error });
      }
      throw error;
    }
  }

  private principalOf(payload: JWTPayload): Principal {
    const consumerId = payload.sub;
    const sessionId = payload[SESSION_CLAIM];
    const claimedRole = payload[ROLE_CLAIM];
    const role = typeof claimedRole === 'string' ? ROLES.get(claimedRole) : undefined;
    if (typeof consumerId !== 'string' || !Uuid.isValid(consumerId)) {
      throw new InvalidAccessToken();
    }
    if (typeof sessionId !== 'string' || !Uuid.isValid(sessionId) || role === undefined) {
      throw new InvalidAccessToken();
    }
    return new Principal(ConsumerId.of(consumerId), SessionId.of(sessionId), role);
  }
}
