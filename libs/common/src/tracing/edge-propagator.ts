import type { Context, TextMapPropagator, TextMapSetter } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

export class EdgePropagator implements TextMapPropagator {
  private readonly outgoing = new W3CTraceContextPropagator();

  public inject(context: Context, carrier: unknown, setter: TextMapSetter): void {
    this.outgoing.inject(context, carrier, setter);
  }

  public extract(context: Context): Context {
    return context;
  }

  public fields(): string[] {
    return this.outgoing.fields();
  }
}
