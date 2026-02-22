import { ServiceUnavailable } from '@ftgo/common';

export class CircuitOpen extends ServiceUnavailable {
  public constructor(service: string) {
    super(
      'gateway.circuit_open',
      `Calls to the ${service} service are paused after repeated failures.`,
    );
  }
}
