import { Injectable, Logger } from '@nestjs/common';

import type { Disposition } from '../dispositions/disposition.js';
import { RetryLater } from '../dispositions/retry-later.js';

import type { FailureHandling } from './failure-handling.js';
import type { Failure } from './failure.js';
import { HandlerBackoff } from './handler-backoff.js';

@Injectable()
export class RetryForeverFailure implements FailureHandling {
  private readonly logger = new Logger(RetryForeverFailure.name);

  public constructor(private readonly backoff: HandlerBackoff) {}

  public async handle(failure: Failure): Promise<Disposition> {
    const delay = this.backoff.delayFor(failure.attempt);
    this.logger.warn(
      { ...failure.logContext(), retryInMs: delay.toMilliseconds() },
      'a dependency is unavailable; the partition pauses and retries',
    );
    return new RetryLater(delay);
  }
}
