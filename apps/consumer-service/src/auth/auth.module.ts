import { Clock } from '@ftgo/common';
import { Module, type DynamicModule, type Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import type { TokenConfig } from '../config/token.config.js';
import { ConsumersModule } from '../consumers/consumers.module.js';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthenticationGuard } from './guards/authentication.guard.js';
import { JwksController } from './jwks.controller.js';
import { Argon2PasswordHashing } from './passwords/argon2-password-hashing.js';
import { PasswordHashing } from './passwords/password-hashing.js';
import { PostgresSessions } from './sessions/postgres-sessions.js';
import { SessionPolicy } from './sessions/session-policy.js';
import { Sessions } from './sessions/sessions.js';
import { AccessTokens } from './tokens/access-tokens.js';
import { JwtAccessTokens } from './tokens/jwt-access-tokens.js';
import { SessionTokens } from './tokens/session-tokens.js';
import { SigningKeys } from './tokens/signing-keys.js';

@Module({})
export class AuthModule {
  public static with(config: TokenConfig): DynamicModule {
    return {
      module: AuthModule,
      imports: [ConsumersModule],
      controllers: [AuthController, JwksController],
      providers: [
        AuthService,
        SessionTokens,
        { provide: APP_GUARD, useClass: AuthenticationGuard },
        { provide: Sessions, useClass: PostgresSessions },
        ...AuthModule.securityProviders(config),
      ],
    };
  }

  private static securityProviders(config: TokenConfig): Provider[] {
    return [
      { provide: SessionPolicy, useValue: { lifetime: config.sessionLifetime } },
      {
        provide: SigningKeys,
        useFactory: async (): Promise<SigningKeys> => SigningKeys.load(config.encodedSigningKey),
      },
      {
        provide: AccessTokens,
        useFactory: (keys: SigningKeys, clock: Clock): AccessTokens =>
          new JwtAccessTokens(keys, config, clock),
        inject: [SigningKeys, Clock],
      },
      {
        provide: PasswordHashing,
        useFactory: async (): Promise<PasswordHashing> => Argon2PasswordHashing.create(),
      },
    ];
  }
}
