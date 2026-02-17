import { Clock, Transactions } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';
import type { Static, TSchema } from 'typebox';

import { InvalidSagaDefinition } from '../errors/invalid-saga-definition.js';
import { NoActiveTransaction } from '../errors/no-active-transaction.js';
import type { SagaDefinition } from '../saga-definition.js';
import { SagaInstance } from '../saga-instance.js';
import type { Sagas } from '../sagas.js';

import { SagaInstances } from './persistence/saga-instances.js';
import { SagaDefinitions } from './saga-definitions.js';
import { SagaExecution } from './saga-execution.js';

@Injectable()
export class OrchestratedSagas implements Sagas {
  public constructor(
    @Inject(Transactions) private readonly transactions: Transactions,
    @Inject(SagaInstances) private readonly instances: SagaInstances,
    @Inject(Clock) private readonly clock: Clock,
    private readonly definitions: SagaDefinitions,
    private readonly execution: SagaExecution,
  ) {}

  public async start<DataSchema extends TSchema>(
    definition: SagaDefinition<DataSchema>,
    data: Static<DataSchema>,
  ): Promise<void> {
    if (!this.transactions.isActive()) {
      throw new NoActiveTransaction();
    }
    if (!this.definitions.has(definition)) {
      throw new InvalidSagaDefinition(definition.sagaType, 'it is not registered in SagaModule.');
    }
    const instance = SagaInstance.begin(definition.sagaType, data, this.clock.now());
    await this.execution.run(definition, instance);
    await this.instances.add(instance);
  }
}
