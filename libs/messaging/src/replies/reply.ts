import type { FailureReplyPayload } from '@ftgo/contracts';

import { ReplyOutcome } from './reply-outcome.js';

export class Reply<Payload> {
  private constructor(
    public readonly outcome: ReplyOutcome,
    public readonly payload: Payload | FailureReplyPayload,
  ) {}

  public static success<Payload>(payload: Payload): Reply<Payload> {
    return new Reply(ReplyOutcome.Success, payload);
  }

  public static failure(reason: string): Reply<never> {
    return new Reply<never>(ReplyOutcome.Failure, { reason });
  }

  public static isReply(value: unknown): value is Reply<unknown> {
    return value instanceof Reply;
  }

  public isSuccess(): boolean {
    return this.outcome === ReplyOutcome.Success;
  }
}
