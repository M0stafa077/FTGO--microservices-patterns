import type { CommandDefinition } from '@ftgo/contracts';
import { OutgoingMessage, type Outbox, type SagaRouting } from '@ftgo/messaging';
import type { Static, TSchema } from 'typebox';

import type { SagaCommands } from '../saga-commands.js';

export class OutboxSagaCommands implements SagaCommands {
  public constructor(
    private readonly outbox: Outbox,
    private readonly routing: SagaRouting,
  ) {}

  public async send<Payload extends TSchema>(
    definition: CommandDefinition<Payload, TSchema>,
    payload: Static<Payload>,
  ): Promise<string> {
    const command = OutgoingMessage.command(definition, payload, this.routing);
    await this.outbox.append(command);
    return command.messageId;
  }
}
