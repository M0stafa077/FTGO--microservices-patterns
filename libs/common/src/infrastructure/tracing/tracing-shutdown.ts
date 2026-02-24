import { Inject, Injectable, type OnApplicationShutdown } from '@nestjs/common';

import { Tracing } from '../../tracing/tracing.js';

@Injectable()
export class TracingShutdown implements OnApplicationShutdown {
  public constructor(@Inject(Tracing) private readonly tracing: Tracing) {}

  public async onApplicationShutdown(): Promise<void> {
    await this.tracing.shutdown();
  }
}
