import { Module, type DynamicModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import type { AccessConfig } from './access.config.js';
import { AccessGuard } from './access.guard.js';
import { RemoteAccessTokens } from './remote-access-tokens.js';

@Module({})
export class AccessModule {
  public static with(config: AccessConfig): DynamicModule {
    return {
      module: AccessModule,
      providers: [
        { provide: RemoteAccessTokens, useValue: new RemoteAccessTokens(config) },
        { provide: APP_GUARD, useClass: AccessGuard },
      ],
    };
  }
}
