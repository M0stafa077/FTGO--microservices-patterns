import { Conflict } from '@ftgo/common';

export class ConsumerGroupActive extends Conflict {
  public constructor(groupId: string, options?: ErrorOptions) {
    super(
      'messaging.consumer_group_active',
      `Consumer group ${groupId} still has members. Stop every instance of the service first.`,
      options,
    );
  }
}
