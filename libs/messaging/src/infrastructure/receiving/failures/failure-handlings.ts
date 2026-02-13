import { ErrorCategory, FtgoError } from '@ftgo/common';
import { Injectable } from '@nestjs/common';

import { DeadLetterFailure } from './dead-letter-failure.js';
import type { FailureHandling } from './failure-handling.js';
import { FailureReply } from './failure-reply.js';
import { LimitedRetryFailure } from './limited-retry-failure.js';
import { RetryForeverFailure } from './retry-forever-failure.js';

@Injectable()
export class FailureHandlings {
  public constructor(
    private readonly deadLetter: DeadLetterFailure,
    private readonly retryForever: RetryForeverFailure,
    private readonly limitedRetry: LimitedRetryFailure,
    private readonly failureReply: FailureReply,
  ) {}

  public for(error: unknown): FailureHandling {
    if (!(error instanceof FtgoError)) {
      return this.limitedRetry;
    }
    return this.forCategory(error.category);
  }

  public whenHandlingFails(): FailureHandling {
    return this.retryForever;
  }

  private forCategory(category: ErrorCategory): FailureHandling {
    switch (category) {
      case ErrorCategory.InvalidInput:
      case ErrorCategory.Unauthenticated:
        return this.deadLetter;
      case ErrorCategory.NotFound:
      case ErrorCategory.RuleViolation:
        return this.failureReply;
      case ErrorCategory.Conflict:
        return this.limitedRetry;
      case ErrorCategory.Unavailable:
        return this.retryForever;
      default: {
        const unreachable: never = category;
        return unreachable;
      }
    }
  }
}
