import { ReplyReceiver } from '@ftgo/messaging/infrastructure';
import { Module, type DynamicModule } from '@nestjs/common';

import { Sagas } from '../sagas.js';

import { CompiledSchemaDecoder } from './compiled-schema-decoder.js';
import { OrchestratedSagas } from './orchestrated-sagas.js';
import { PostgresSagaInstances } from './persistence/postgres-saga-instances.js';
import { SagaInstances } from './persistence/saga-instances.js';
import { SagaDefinitions } from './saga-definitions.js';
import { SagaExecution } from './saga-execution.js';
import { SagaOptions } from './saga-options.js';
import { SagaReplies } from './saga-replies.js';

@Module({})
export class SagaModule {
  public static with(options: SagaOptions): DynamicModule {
    return {
      module: SagaModule,
      global: true,
      providers: [
        { provide: SagaOptions, useValue: options },
        SagaDefinitions,
        CompiledSchemaDecoder,
        SagaExecution,
        { provide: SagaInstances, useClass: PostgresSagaInstances },
        { provide: Sagas, useClass: OrchestratedSagas },
        SagaReplies,
        { provide: ReplyReceiver, useExisting: SagaReplies },
      ],
      exports: [Sagas, ReplyReceiver],
    };
  }
}
