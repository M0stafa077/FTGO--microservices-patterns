import type { TSchema } from 'typebox';

import type { ReplyDefinition } from './reply-definition.js';

export class CommandDefinition<Payload extends TSchema, SuccessPayload extends TSchema> {
  public constructor(
    public readonly type: string,
    public readonly channel: string,
    public readonly payload: Payload,
    public readonly reply: ReplyDefinition<SuccessPayload>,
  ) {}
}
