import {
  Global,
  Module,
  type DynamicModule,
  type MiddlewareConsumer,
  type NestModule,
} from '@nestjs/common';
import { LoggerModule as PinoLoggerModule, type Params } from 'nestjs-pino';

import { REDACTED } from '../../common.constants.js';
import { CorrelationIds } from '../http/correlation-ids.js';
import { CorrelationMiddleware } from '../http/correlation.middleware.js';
import { ALL_ROUTES } from '../infrastructure.constants.js';

import { CorrelationScope } from './correlation-scope.js';
import type { LoggingOptions } from './logging-options.js';
import { SpanLogFields } from './span-log-fields.js';

@Global()
@Module({})
export class LoggingModule implements NestModule {
  public static with(options: LoggingOptions): DynamicModule {
    const scope = new CorrelationScope();
    return {
      module: LoggingModule,
      imports: [PinoLoggerModule.forRoot(LoggingModule.pinoParameters(options, scope))],
      providers: [{ provide: CorrelationScope, useValue: scope }],
      exports: [PinoLoggerModule, CorrelationScope],
    };
  }

  private static pinoParameters(options: LoggingOptions, scope: CorrelationScope): Params {
    const correlationIds = new CorrelationIds();
    const spanFields = new SpanLogFields();
    return {
      pinoHttp: {
        level: options.level,
        genReqId: (request, response) => correlationIds.assign(request, response),
        customAttributeKeys: { reqId: 'correlationId' },
        mixin: () => ({ correlationId: scope.current(), ...spanFields.current() }),
        autoLogging: { ignore: (request) => request.url?.startsWith('/health') === true },
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
          censor: REDACTED,
        },
      },
    };
  }

  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationMiddleware).forRoutes(ALL_ROUTES);
  }
}
