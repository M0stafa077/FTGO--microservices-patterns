import { Inject, Injectable, Logger } from '@nestjs/common';

import { MessagingOptions } from '../../messaging-options.js';
import type { Disposition } from '../dispositions/disposition.js';
import { RetryLater } from '../dispositions/retry-later.js';

import { DeadLetterFailure } from './dead-letter-failure.js';
import type { FailureHandling } from './failure-handling.js';
import type { Failure } from './failure.js';
import { HandlerBackoff } from './handler-backoff.js';

@Injectable()
export class LimitedRetryFailure implements FailureHandling {
  private readonly logger = new Logger(LimitedRetryFailure.name);

  public constructor(
    private readonly deadLetter: DeadLetterFailure,
    private readonly backoff: HandlerBackoff,
    @Inject(MessagingOptions) private readonly options: MessagingOptions,
  ) {}

  public async handle(failure: Failure): Promise<Disposition> {
    if (failure.attempt >= this.options.config.handlers.maxAttempts) {
      return this.deadLetter.handle(failure);
    }
    const delay = this.backoff.delayFor(failure.attempt);
    this.logger.warn(
      { ...failure.logContext(), retryInMs: delay.toMilliseconds() },
      'message handling failed; retrying',
    );
    return new RetryLater(delay);
  }
}
