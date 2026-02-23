import { KafkaJS } from '@confluentinc/kafka-javascript';
import { ServiceUnavailable } from '@ftgo/common';

import type { KafkaSettings } from '../config/kafka-settings.js';

import { ConsumerGroupActive } from './errors/consumer-group-active.js';

export class KafkaConsumerGroups {
  public constructor(private readonly settings: KafkaSettings) {}

  public async remove(groupId: string): Promise<void> {
    const admin = this.adminFor(groupId);
    try {
      await admin.connect();
      await admin.deleteGroups([groupId]);
    } catch (error) {
      this.rethrowUnlessAbsent(groupId, error);
    } finally {
      await admin.disconnect();
    }
  }

  private adminFor(groupId: string): KafkaJS.Admin {
    return new KafkaJS.Kafka({
      kafkaJS: {
        brokers: [...this.settings.brokers],
        clientId: this.settings.clientId ?? groupId,
        connectionTimeout: this.settings.connectionTimeout.toMilliseconds(),
        logLevel: KafkaJS.logLevel.NOTHING,
      },
    }).admin();
  }

  private rethrowUnlessAbsent(groupId: string, error: unknown): void {
    const codes = this.groupErrorCodesOf(error);
    if (
      codes.length > 0 &&
      codes.every((code) => code === KafkaJS.ErrorCodes.ERR_GROUP_ID_NOT_FOUND)
    ) {
      return;
    }
    if (codes.includes(KafkaJS.ErrorCodes.ERR_NON_EMPTY_GROUP)) {
      throw new ConsumerGroupActive(groupId, { cause: error });
    }
    throw new ServiceUnavailable(
      'kafka.unavailable',
      `Kafka did not remove consumer group ${groupId}.`,
      { cause: error },
    );
  }

  private groupErrorCodesOf(error: unknown): ReadonlyArray<number> {
    if (!(error instanceof KafkaJS.KafkaJSDeleteGroupsError)) {
      return [];
    }
    return error.groups.map((group) => group.errorCode ?? group.error?.code ?? 0);
  }
}
