import type { Static, TSchema } from 'typebox';

import type { SagaStep } from './saga-step.js';

export interface SagaDefinition<DataSchema extends TSchema> {
  readonly sagaType: string;
  readonly data: DataSchema;
  readonly steps: ReadonlyArray<SagaStep<Static<DataSchema>>>;
}
