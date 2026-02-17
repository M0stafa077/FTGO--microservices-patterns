import { HeaderName, type IncomingMessage } from '@ftgo/messaging';
import type { ReplyReceiver } from '@ftgo/messaging/infrastructure';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { SAGA_REPLIES_SUFFIX } from './infrastructure.constants.js';
import { SagaInstances } from './persistence/saga-instances.js';
import { SagaDefinitions } from './saga-definitions.js';
import { SagaExecution } from './saga-execution.js';
import { SagaOptions } from './saga-options.js';

@Injectable()
export class SagaReplies implements ReplyReceiver {
  public readonly channel: string;
  private readonly logger = new Logger(SagaReplies.name);

  public constructor(
    @Inject(SagaOptions) options: SagaOptions,
    @Inject(SagaInstances) private readonly instances: SagaInstances,
    private readonly definitions: SagaDefinitions,
    private readonly execution: SagaExecution,
  ) {
    this.channel = `${options.serviceName}${SAGA_REPLIES_SUFFIX}`;
  }

  public async receive(reply: IncomingMessage<unknown>): Promise<void> {
    const instance = await this.instances.getById(reply.headers.get(HeaderName.SagaId));
    const inReplyTo = reply.headers.get(HeaderName.InReplyTo);
    if (!instance.isWaitingFor(inReplyTo)) {
      this.logger.warn(
        { sagaId: instance.id.toString(), inReplyTo, replyId: reply.messageId },
        'reply ignored: the saga does not wait for it',
      );
      return;
    }
    await this.execution.acceptReply(this.definitions.get(instance.sagaType), instance, reply);
    await this.instances.update(instance);
  }
}
