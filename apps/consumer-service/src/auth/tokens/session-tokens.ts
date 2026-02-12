import { Clock } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import type { ConsumerId } from '../../consumers/entities/consumer-id.js';
import { RefreshToken } from '../entities/refresh-token.js';
import { SessionId } from '../entities/session-id.js';
import { Session } from '../entities/session.entity.js';
import { Principal } from '../principal.js';
import { SessionPolicy } from '../sessions/session-policy.js';
import { Sessions } from '../sessions/sessions.js';

import { AccessTokens } from './access-tokens.js';
import type { TokenPair } from './token-pair.js';

@Injectable()
export class SessionTokens {
  public constructor(
    @Inject(Sessions) private readonly sessions: Sessions,
    @Inject(AccessTokens) private readonly accessTokens: AccessTokens,
    @Inject(SessionPolicy) private readonly policy: SessionPolicy,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async startFor(consumerId: ConsumerId): Promise<TokenPair> {
    const refreshToken = RefreshToken.issueFor(SessionId.generate());
    const session = Session.start(consumerId, refreshToken, this.clock.now(), this.policy.lifetime);
    await this.sessions.add(session);
    return this.issue(session, refreshToken);
  }

  public async issue(session: Session, refreshToken: RefreshToken): Promise<TokenPair> {
    const accessToken = await this.accessTokens.issue(
      new Principal(session.consumerId, session.id),
    );
    return {
      accessToken,
      refreshToken: refreshToken.reveal(),
      refreshTokenExpiresAt: session.expiresAt,
    };
  }
}
