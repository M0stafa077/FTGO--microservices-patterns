import type { KafkaJS } from '@confluentinc/kafka-javascript';

export class KafkaHeaders {
  public decode(headers: KafkaJS.IHeaders | undefined): Readonly<Record<string, string>> {
    return Object.fromEntries(
      Object.entries(headers ?? {}).flatMap(([name, value]): [string, string][] => {
        if (typeof value === 'string') {
          return [[name, value]];
        }
        if (Buffer.isBuffer(value)) {
          return [[name, value.toString('utf8')]];
        }
        return [];
      }),
    );
  }
}
