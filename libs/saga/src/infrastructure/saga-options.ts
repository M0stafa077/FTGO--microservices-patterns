import type { Type } from '@nestjs/common';
import type { TSchema } from 'typebox';

import type { SagaDefinition } from '../saga-definition.js';

export interface SagaOptions {
  readonly serviceName: string;
  readonly definitions: ReadonlyArray<Type<SagaDefinition<TSchema>>>;
}
export const SagaOptions = Symbol('SagaOptions');
