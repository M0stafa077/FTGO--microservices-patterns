import { Clock } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import { Consumers } from '../consumers/consumers.js';
import { Consumer } from '../consumers/entities/consumer.entity.js';
import type { EmailAddress } from '../consumers/entities/email-address.js';
import type { Password } from '../consumers/entities/password.js';
import { EmailAlreadyRegistered } from '../consumers/errors/email-already-registered.js';

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
    @Inject(Consumers) private readonly consumers: Consumers,
    @Inject(Sessions) private readonly sessions: Sessions,
    @Inject(PasswordHashing) private readonly passwordHashing: PasswordHashing,
    private readonly sessionTokens: SessionTokens,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async register(details: NewConsumer): Promise<Consumer> {
    if ((await this.consumers.findByEmail(details.email)) !== undefined) {
      throw new EmailAlreadyRegistered();
    }
    const consumer = Consumer.register(
      {
        email: details.email,
        passwordHash: await this.passwordHashing.hash(details.password),
        name: details.name,
        phoneNumber: details.phoneNumber,
      },
      this.clock.now(),
    );
    await this.consumers.add(consumer);
    return consumer;
  }

  public async signIn(email: EmailAddress, password: Password): Promise<TokenPair> {
    const consumer = await this.consumers.findByEmail(email);
    const isValid = await this.passwordHashing.verify(password, consumer?.passwordHash);
    if (consumer === undefined || !isValid) {
      throw new InvalidCredentials();
    }
    return this.sessionTokens.startFor(consumer.id);
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
    return this.sessionTokens.issue(session, next);
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
