import type { BrokerMessage } from './broker-message.js';

export interface MessageBroker {
  publish(messages: ReadonlyArray<BrokerMessage>): Promise<void>;
}
export const MessageBroker = Symbol('MessageBroker');
