import type { OutgoingMessage } from './envelope/outgoing-message.js';

export interface Outbox {
  append(message: OutgoingMessage): Promise<void>;
}
export const Outbox = Symbol('Outbox');
