import { Injectable, Logger } from '@nestjs/common';

import { Completed } from '../dispositions/completed.js';
import type { Disposition } from '../dispositions/disposition.js';

import { DeadLetters } from './dead-letters.js';
import type { FailureHandling } from './failure-handling.js';
import type { Failure } from './failure.js';

@Injectable()
export class DeadLetterFailure implements FailureHandling {
  private readonly logger = new Logger(DeadLetterFailure.name);

  public constructor(private readonly deadLetters: DeadLetters) {}

  public async handle(failure: Failure): Promise<Disposition> {
    await this.deadLetters.send(failure);
    this.logger.error(failure.logContext(), 'message sent to the dead-letter topic');
    return new Completed();
  }
}
