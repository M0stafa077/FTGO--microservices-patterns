import type { CommandDefinition } from '@ftgo/contracts';
import type { Static, TSchema } from 'typebox';

import { PendingReply } from './pending-reply.js';
import type { SagaAction } from './saga-action.js';
import type { SagaCommands } from './saga-commands.js';
import type { SchemaDecoder } from './schema-decoder.js';

export class ParticipantCommand<
  Data,
  Payload extends TSchema,
  Reply extends TSchema,
> implements SagaAction<Data> {
  public constructor(
    private readonly definition: CommandDefinition<Payload, Reply>,
    private readonly payloadOf: (data: Data) => Static<Payload>,
    private readonly onSuccess: (data: Data, reply: Static<Reply>) => Data = (data) => data,
  ) {}

  public async perform(data: Data, commands: SagaCommands): Promise<PendingReply | undefined> {
    return new PendingReply(await commands.send(this.definition, this.payloadOf(data)));
  }

  public acceptReply(data: Data, payload: unknown, decoder: SchemaDecoder): Data {
    return this.onSuccess(data, decoder.decode(this.definition.reply.payload, payload));
  }
}
