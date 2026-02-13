import { Injectable, Logger } from '@nestjs/common';

import { Completed } from '../dispositions/completed.js';
import type { Disposition } from '../dispositions/disposition.js';
import { EffectivelyOnce } from '../effectively-once.js';

import { DeadLetterFailure } from './dead-letter-failure.js';
import type { FailureHandling } from './failure-handling.js';
import type { Failure } from './failure.js';

@Injectable()
export class FailureReply implements FailureHandling {
  private readonly logger = new Logger(FailureReply.name);

  public constructor(
    private readonly effectivelyOnce: EffectivelyOnce,
    private readonly deadLetter: DeadLetterFailure,
  ) {}

  public async handle(failure: Failure): Promise<Disposition> {
    const { rejection } = failure;
    if (rejection === undefined) {
      return this.deadLetter.handle(failure);
    }
    await this.effectivelyOnce.process(rejection.message, async () => rejection.reply);
    this.logger.log(
      { messageId: rejection.message.messageId, code: failure.code },
      'command rejected with a failure reply',
    );
    return new Completed();
  }
}
