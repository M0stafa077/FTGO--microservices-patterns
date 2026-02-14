import { Clock } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import { ConsumersService } from '../consumers/consumers.service.js';
import type { Consumer } from '../consumers/entities/consumer.entity.js';
import type { EmailAddress } from '../consumers/entities/email-address.js';
import type { Password } from '../consumers/entities/password.js';

import { RefreshToken } from './entities/refresh-token.js';
import { RotationOutcome } from './entities/rotation-outcome.js';
import { InvalidCredentials } from './errors/invalid-credentials.js';
import { InvalidRefreshToken } from './errors/invalid-refresh-token.js';
import { RefreshTokenReused } from './errors/refresh-token-reused.js';
import type { NewConsumer } from './new-consumer.js';
import { PasswordHashing } from './passwords/password-hashing.js';
import type { Principal } from './principal.js';
import { Sessions } from './sessions/sessions.js';
import { SessionTokens } from './tokens/session-tokens.js';
import type { TokenPair } from './tokens/token-pair.js';

@Injectable()
export class AuthService {
  public constructor(
    private readonly consumersService: ConsumersService,
    @Inject(Sessions) private readonly sessions: Sessions,
    @Inject(PasswordHashing) private readonly passwordHashing: PasswordHashing,
    private readonly sessionTokens: SessionTokens,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async register(details: NewConsumer): Promise<Consumer> {
    return this.consumersService.register({
      email: details.email,
      passwordHash: await this.passwordHashing.hash(details.password),
      name: details.name,
      phoneNumber: details.phoneNumber,
    });
  }

  public async signIn(email: EmailAddress, password: Password): Promise<TokenPair> {
    const consumer = await this.consumersService.findByEmail(email);
    const isValid = await this.passwordHashing.verify(password, consumer?.passwordHash);
    if (consumer === undefined || !isValid) {
      throw new InvalidCredentials();
    }
    return this.sessionTokens.startFor(consumer);
  }

  public async refresh(rawRefreshToken: string): Promise<TokenPair> {
    const presented = RefreshToken.parse(rawRefreshToken);
    const session = await this.sessions.findById(presented.sessionId);
    if (session === undefined) {
      throw new InvalidRefreshToken();
    }
    const next = RefreshToken.issueFor(session.id);
    const outcome = session.rotate(presented, next, this.clock.now());
    await this.sessions.update(session);
    if (outcome === RotationOutcome.ReuseDetected) {
      throw new RefreshTokenReused();
    }
    const consumer = await this.consumersService.getById(session.consumerId);
    return this.sessionTokens.issue(session, next, consumer.role);
  }

  public async signOut(principal: Principal): Promise<void> {
    const session = await this.sessions.findById(principal.sessionId);
    if (session === undefined) {
      return;
    }
    session.end(this.clock.now());
    await this.sessions.update(session);
  }
}
