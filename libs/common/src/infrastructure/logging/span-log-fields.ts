import { trace } from '@opentelemetry/api';

export class SpanLogFields {
  public current(): Readonly<Record<string, string>> {
    const span = trace.getActiveSpan();
    if (span === undefined) {
      return {};
    }
    const { traceId, spanId } = span.spanContext();
    return { traceId, spanId };
  }
}
