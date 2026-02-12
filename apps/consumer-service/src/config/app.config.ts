import { Environment } from '@ftgo/common/infrastructure';
import type { Level } from 'pino';

import { DatabaseConfig } from './database.config.js';
import { AppEnvironment } from './schemas/app-environment.schema.js';
import { TokenConfig } from './token.config.js';

export class AppConfig {
  private constructor(
    public readonly port: number,
    public readonly logLevel: Level,
    public readonly database: DatabaseConfig,
    public readonly tokens: TokenConfig,
  ) {}

  public static fromEnvironment(environment: Environment): AppConfig {
    const variables = environment.read(AppEnvironment);
    return new AppConfig(
      variables.CONSUMER_SERVICE_PORT,
      variables.LOG_LEVEL,
      DatabaseConfig.fromEnvironment(environment),
      TokenConfig.fromEnvironment(environment),
    );
  }
}
