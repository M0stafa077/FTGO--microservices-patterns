import { Duration } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import { INITIAL_BACKOFF_MS } from '../../infrastructure.constants.js';
import { MessagingOptions } from '../../messaging-options.js';
import { Backoff } from '../../time/backoff.js';

@Injectable()
export class HandlerBackoff {
  private readonly backoff: Backoff;

  public constructor(@Inject(MessagingOptions) options: MessagingOptions) {
    this.backoff = new Backoff(
      Duration.ofMilliseconds(INITIAL_BACKOFF_MS),
      options.config.handlers.maxBackoff,
    );
  }

  public delayFor(attempt: number): Duration {
    return this.backoff.delayFor(attempt);
  }
}
