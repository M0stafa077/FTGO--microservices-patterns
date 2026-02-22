import { AccessConfig, Environment } from '@ftgo/common/infrastructure';
import type { Level } from 'pino';

import { AppEnvironment } from './schemas/app-environment.schema.js';
import { ServicesConfig } from './services.config.js';

export class AppConfig {
  private constructor(
    public readonly port: number,
    public readonly logLevel: Level,
    public readonly access: AccessConfig,
    public readonly services: ServicesConfig,
  ) {}

  public static fromEnvironment(environment: Environment): AppConfig {
    const variables = environment.read(AppEnvironment);
    return new AppConfig(
      variables.API_GATEWAY_PORT,
      variables.LOG_LEVEL,
      AccessConfig.fromEnvironment(environment),
      ServicesConfig.fromEnvironment(environment),
    );
  }
}
