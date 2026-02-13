import { FtgoError, InvalidInput } from '@ftgo/common';

import { HeaderName } from '../../../envelope/header-name.js';
import {
  ERROR_MESSAGE_MAX_LENGTH,
  UNKNOWN_FAILURE_REASON,
} from '../../infrastructure.constants.js';
import type { Delivery } from '../delivery.js';
import type { Rejection } from '../handlers/rejection.js';

export class Failure {
  private constructor(
    public readonly delivery: Delivery,
    public readonly error: unknown,
    public readonly attempt: number,
    public readonly rejection: Rejection | undefined,
  ) {}

  public get code(): string {
    return this.error instanceof FtgoError ? this.error.code : UNKNOWN_FAILURE_REASON;
  }

  public get description(): string {
    const message = this.error instanceof Error ? this.error.message : String(this.error);
    const issues =
      this.error instanceof InvalidInput
        ? this.error.issues.map((issue) => `${issue.pointer} ${issue.detail}.`)
        : [];
    return [message, ...issues].join(' ').slice(0, ERROR_MESSAGE_MAX_LENGTH);
  }

  public static beforeHandling(delivery: Delivery, error: unknown, attempt: number): Failure {
    return new Failure(delivery, error, attempt, undefined);
  }

  public static whileHandling(
    delivery: Delivery,
    error: unknown,
    attempt: number,
    rejection: Rejection | undefined,
  ): Failure {
    return new Failure(delivery, error, attempt, rejection);
  }

  public logContext(): Readonly<Record<string, unknown>> {
    return {
      err: this.error,
      code: this.code,
      messageId: this.delivery.headers[HeaderName.MessageId],
      type: this.delivery.type,
      topic: this.delivery.position.topic,
      partition: this.delivery.position.partition,
      offset: this.delivery.position.offset,
      attempt: this.attempt,
    };
  }
}
