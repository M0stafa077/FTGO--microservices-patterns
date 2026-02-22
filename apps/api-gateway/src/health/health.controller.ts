import { Public } from '@ftgo/common/infrastructure';
import { Controller, Get, Header } from '@nestjs/common';

import { HEALTHY } from './health.constants.js';

@Public()
@Controller('health')
export class HealthController {
  @Get('live')
  @Header('Cache-Control', 'no-store')
  public live(): { readonly status: string } {
    return HEALTHY;
  }

  @Get('ready')
  @Header('Cache-Control', 'no-store')
  public ready(): { readonly status: string } {
    return HEALTHY;
  }
}
