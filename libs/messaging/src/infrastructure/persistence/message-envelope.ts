export interface MessageEnvelope {
  readonly messageId: string;
  readonly createdAt: Date;
  readonly correlationId: string;
}
