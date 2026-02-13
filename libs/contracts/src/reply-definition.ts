import type { TSchema } from 'typebox';

export class ReplyDefinition<Payload extends TSchema> {
  public constructor(
    public readonly type: string,
    public readonly payload: Payload,
  ) {}
}
