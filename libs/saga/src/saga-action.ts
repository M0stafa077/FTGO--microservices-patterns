import type { PendingReply } from './pending-reply.js';
import type { SagaCommands } from './saga-commands.js';
import type { SchemaDecoder } from './schema-decoder.js';

export interface SagaAction<Data> {
  perform(data: Data, commands: SagaCommands): Promise<PendingReply | undefined>;

  acceptReply(data: Data, payload: unknown, decoder: SchemaDecoder): Data;
}
