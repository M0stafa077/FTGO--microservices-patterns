import type { SagaInstance } from '../../saga-instance.js';

export interface SagaInstances {
  getById(id: string): Promise<SagaInstance>;

  add(instance: SagaInstance): Promise<void>;

  update(instance: SagaInstance): Promise<void>;
}
export const SagaInstances = Symbol('SagaInstances');
