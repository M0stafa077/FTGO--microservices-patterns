import type { TSchema } from 'typebox';

export class EventDefinition<Payload extends TSchema> {
  public constructor(
    public readonly type: string,
    public readonly channel: string,
    public readonly aggregateType: string,
    public readonly payload: Payload,
  ) {}
}
