import { AccessConfig, Environment } from '@ftgo/common/infrastructure';
import { MessagingConfig } from '@ftgo/messaging/infrastructure';
import type { Level } from 'pino';

import { DatabaseConfig } from './database.config.js';
import { AppEnvironment } from './schemas/app-environment.schema.js';

export class AppConfig {
  private constructor(
    public readonly port: number,
    public readonly logLevel: Level,
    public readonly database: DatabaseConfig,
    public readonly access: AccessConfig,
    public readonly messaging: MessagingConfig,
  ) {}

  public static fromEnvironment(environment: Environment): AppConfig {
    const variables = environment.read(AppEnvironment);
    return new AppConfig(
      variables.ORDER_HISTORY_SERVICE_PORT,
      variables.LOG_LEVEL,
      DatabaseConfig.fromEnvironment(environment),
      AccessConfig.fromEnvironment(environment),
      MessagingConfig.fromEnvironment(environment),
    );
  }
}
