import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Controller, Get, Header, Inject } from '@nestjs/common';
import { sql } from 'kysely';

import { Public } from '../auth/decorators/public.decorator.js';
import { ConsumerDatabase } from '../database/consumer-database.js';

import { HEALTHY } from './health.constants.js';

@Public()
@Controller('health')
export class HealthController {
  public constructor(@Inject(ConsumerDatabase) private readonly database: ConsumerDatabase) {}

  @Get('live')
  @Header('Cache-Control', 'no-store')
  public live(): { readonly status: string } {
    return HEALTHY;
  }

  @Get('ready')
  @Header('Cache-Control', 'no-store')
  public async ready(): Promise<{ readonly status: string }> {
    try {
      await sql`select 1`.execute(this.database);
      return HEALTHY;
    } catch (error) {
      return PostgresFailure.of(error).rethrow('readiness check');
    }
  }
}
