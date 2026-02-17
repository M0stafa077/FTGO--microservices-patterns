export interface SagaRouting {
  readonly sagaType: string;
  readonly sagaId: string;
  readonly replyTo: string;
}
