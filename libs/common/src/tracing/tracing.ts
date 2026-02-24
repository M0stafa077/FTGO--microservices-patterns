import type { TextMapPropagator } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { registerInstrumentations, type Instrumentation } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { register } from 'import-in-the-middle/register-hooks.mjs';

import { Environment } from '../infrastructure/config/environment.js';

import { EdgePropagator } from './edge-propagator.js';
import { TracingConfig } from './tracing-config.js';
import { EXPORT_TIMEOUT_MS, HEALTH_PATH_PREFIX } from './tracing.constants.js';

export class Tracing {
  private constructor(private readonly provider: NodeTracerProvider) {}

  public static startService(
    serviceName: string,
    variables: Readonly<Record<string, string | undefined>>,
  ): Tracing {
    return Tracing.start(serviceName, variables, new W3CTraceContextPropagator());
  }

  public static startEdge(
    serviceName: string,
    variables: Readonly<Record<string, string | undefined>>,
  ): Tracing {
    return Tracing.start(serviceName, variables, new EdgePropagator());
  }

  private static start(
    serviceName: string,
    variables: Readonly<Record<string, string | undefined>>,
    propagator: TextMapPropagator,
  ): Tracing {
    const config = TracingConfig.fromEnvironment(new Environment(variables));
    register();
    const provider = Tracing.providerOf(serviceName, config);
    provider.register({ propagator });
    registerInstrumentations({
      tracerProvider: provider,
      instrumentations: Tracing.instrumentations(),
    });
    return new Tracing(provider);
  }

  private static providerOf(serviceName: string, config: TracingConfig): NodeTracerProvider {
    return new NodeTracerProvider({
      resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: serviceName }),
      sampler: new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(config.sampleRatio) }),
      spanProcessors: [
        new BatchSpanProcessor(
          new OTLPTraceExporter({ url: config.endpoint.href, timeoutMillis: EXPORT_TIMEOUT_MS }),
        ),
      ],
    });
  }

  private static instrumentations(): Instrumentation[] {
    return [
      new HttpInstrumentation({
        ignoreIncomingRequestHook: (request) =>
          request.url?.startsWith(HEALTH_PATH_PREFIX) === true,
      }),
      new NestInstrumentation(),
      new UndiciInstrumentation(),
      new PgInstrumentation({ requireParentSpan: true, ignoreConnectSpans: true }),
    ];
  }

  public async shutdown(): Promise<void> {
    await this.provider.shutdown();
  }
}
