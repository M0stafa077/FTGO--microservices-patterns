import { Environment } from '@ftgo/common/infrastructure';
import { Pool } from 'pg';

import {
  DATABASE_CONNECT_TIMEOUT_MS,
  DATABASE_IDLE_TIMEOUT_MS,
  DATABASE_STATEMENT_TIMEOUT_MS,
} from './config.constants.js';
import { DatabaseEnvironment } from './schemas/database-environment.schema.js';

export class DatabaseConfig {
  private constructor(
    private readonly url: string,
    private readonly poolSize: number,
  ) {}

  public static fromEnvironment(environment: Environment): DatabaseConfig {
    const variables = environment.read(DatabaseEnvironment);
    return new DatabaseConfig(
      variables.ACCOUNTING_DATABASE_URL,
      variables.ACCOUNTING_DATABASE_POOL_SIZE,
    );
  }

  public createPool(applicationName: string, onIdleClientError: (error: Error) => void): Pool {
    const pool = new Pool({
      connectionString: this.url,
      max: this.poolSize,
      application_name: applicationName,
      connectionTimeoutMillis: DATABASE_CONNECT_TIMEOUT_MS,
      idleTimeoutMillis: DATABASE_IDLE_TIMEOUT_MS,
      statement_timeout: DATABASE_STATEMENT_TIMEOUT_MS,
    });
    pool.on('error', onIdleClientError);
    return pool;
  }
}
