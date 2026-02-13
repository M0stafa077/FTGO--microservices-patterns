export interface ProcessedMessages {
  markProcessed(consumerGroup: string, messageId: string): Promise<boolean>;
}
export const ProcessedMessages = Symbol('ProcessedMessages');
