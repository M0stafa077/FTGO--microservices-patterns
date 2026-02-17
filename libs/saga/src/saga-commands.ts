import type { CommandDefinition } from '@ftgo/contracts';
import type { Static, TSchema } from 'typebox';

export interface SagaCommands {
  send<Payload extends TSchema>(
    definition: CommandDefinition<Payload, TSchema>,
    payload: Static<Payload>,
  ): Promise<string>;
}
