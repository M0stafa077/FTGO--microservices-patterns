import { PostgresFailure, Public } from '@ftgo/common/infrastructure';
import { MessagingHealth } from '@ftgo/messaging/infrastructure';
import { Controller, Get, Header, Inject } from '@nestjs/common';
import { sql } from 'kysely';

import { AccountingDatabase } from '../database/accounting-database.js';

import { HEALTHY } from './health.constants.js';

@Public()
@Controller('health')
export class HealthController {
  public constructor(
    @Inject(AccountingDatabase) private readonly database: AccountingDatabase,
    private readonly messaging: MessagingHealth,
  ) {}

  @Get('live')
  @Header('Cache-Control', 'no-store')
  public live(): { readonly status: string } {
    return HEALTHY;
  }

  @Get('ready')
  @Header('Cache-Control', 'no-store')
  public async ready(): Promise<{ readonly status: string }> {
    await this.checkDatabase();
    this.messaging.verify();
    return HEALTHY;
  }

  private async checkDatabase(): Promise<void> {
    try {
      await sql`select 1`.execute(this.database.current());
    } catch (error) {
      PostgresFailure.of(error).rethrow('readiness check');
    }
  }
}
