import { ServiceUnavailable, type Clock } from '@ftgo/common';
import type { CompiledSchema } from '@ftgo/common/infrastructure';
import type { StaticEncode, TProperties, TSchema } from 'typebox';

import type { ServiceName } from '../config/service-name.js';

import { Circuit } from './entities/circuit.js';
import { CircuitOpen } from './errors/circuit-open.js';
import type { ServiceCalls } from './service-calls.js';

export class CircuitBreakingServiceCalls implements ServiceCalls {
  private readonly circuits = new Map<ServiceName, Circuit>();

  public constructor(
    private readonly inner: ServiceCalls,
    private readonly clock: Clock,
  ) {}

  public async find<T extends TSchema>(
    service: ServiceName,
    path: string,
    authorization: string,
    schema: CompiledSchema<T>,
  ): Promise<StaticEncode<T, TProperties> | undefined> {
    const circuit = this.circuitOf(service);
    if (circuit.isOpen(this.clock.now())) {
      throw new CircuitOpen(service);
    }
    try {
      const result = await this.inner.find(service, path, authorization, schema);
      circuit.recordSuccess();
      return result;
    } catch (error) {
      if (error instanceof ServiceUnavailable) {
        circuit.recordFailure(this.clock.now());
      }
      throw error;
    }
  }

  private circuitOf(service: ServiceName): Circuit {
    const existing = this.circuits.get(service);
    if (existing !== undefined) {
      return existing;
    }
    const circuit = Circuit.closed();
    this.circuits.set(service, circuit);
    return circuit;
  }
}
