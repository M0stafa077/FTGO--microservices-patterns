import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { TSchema } from 'typebox';

import { InvalidSagaDefinition } from '../errors/invalid-saga-definition.js';
import { UnknownSagaType } from '../errors/unknown-saga-type.js';
import type { SagaDefinition } from '../saga-definition.js';

import { SagaOptions } from './saga-options.js';

@Injectable()
export class SagaDefinitions implements OnModuleInit {
  private readonly definitions = new Map<string, SagaDefinition<TSchema>>();

  public constructor(
    @Inject(SagaOptions) private readonly options: SagaOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  public onModuleInit(): void {
    for (const type of this.options.definitions) {
      this.register(this.moduleRef.get(type, { strict: false }));
    }
  }

  public get(sagaType: string): SagaDefinition<TSchema> {
    const definition = this.definitions.get(sagaType);
    if (definition === undefined) {
      throw new UnknownSagaType(sagaType);
    }
    return definition;
  }

  public has(definition: SagaDefinition<TSchema>): boolean {
    return this.definitions.get(definition.sagaType) === definition;
  }

  private register(definition: SagaDefinition<TSchema>): void {
    const { sagaType, steps } = definition;
    if (sagaType.trim().length === 0) {
      throw new InvalidSagaDefinition(sagaType, 'the saga type is empty.');
    }
    if (this.definitions.has(sagaType)) {
      throw new InvalidSagaDefinition(sagaType, 'another saga has the same type.');
    }
    if (steps.length === 0) {
      throw new InvalidSagaDefinition(sagaType, 'it has no steps.');
    }
    if (steps.some((step) => step.action === undefined && step.compensation === undefined)) {
      throw new InvalidSagaDefinition(sagaType, 'a step has neither an action nor a compensation.');
    }
    this.definitions.set(sagaType, definition);
  }
}
