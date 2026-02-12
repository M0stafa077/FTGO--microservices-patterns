import { Module, type DynamicModule } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

import { CorrelationIds } from '../http/correlation-ids.js';

import type { LoggingOptions } from './logging-options.js';

@Module({})
export class LoggingModule {
  public static with(options: LoggingOptions): DynamicModule {
    const correlationIds = new CorrelationIds();
    return {
      module: LoggingModule,
      imports: [
        PinoLoggerModule.forRoot({
          pinoHttp: {
            level: options.level,
            genReqId: (request, response) => correlationIds.assign(request, response),
            customAttributeKeys: { reqId: 'correlationId' },
            autoLogging: { ignore: (request) => request.url?.startsWith('/health') === true },
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'res.headers["set-cookie"]',
              ],
              censor: '[redacted]',
            },
          },
        }),
      ],
      exports: [PinoLoggerModule],
    };
  }
}
