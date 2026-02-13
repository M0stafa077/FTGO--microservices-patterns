import type { MessagingConfig } from './config/messaging-config.js';

export interface MessagingOptions {
  readonly serviceName: string;
  readonly config: MessagingConfig;
}
export const MessagingOptions = Symbol('MessagingOptions');
