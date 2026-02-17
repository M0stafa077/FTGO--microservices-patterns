import type { Static, TSchema } from 'typebox';

import type { SagaDefinition } from './saga-definition.js';

export interface Sagas {
  start<DataSchema extends TSchema>(
    definition: SagaDefinition<DataSchema>,
    data: Static<DataSchema>,
  ): Promise<void>;
}
export const Sagas = Symbol('Sagas');
