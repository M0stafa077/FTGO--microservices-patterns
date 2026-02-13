export interface BrokerMessage {
  readonly topic: string;
  readonly key: string | null;
  readonly value: string | null;
  readonly headers: Readonly<Record<string, string>>;
}
