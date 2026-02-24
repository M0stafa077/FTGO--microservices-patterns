import type { IncomingMessage, ServerResponse } from 'node:http';

import { Injectable, type NestMiddleware } from '@nestjs/common';
import { trace } from '@opentelemetry/api';

import { CORRELATION_ID_ATTRIBUTE } from '../infrastructure.constants.js';
import { CorrelationScope } from '../logging/correlation-scope.js';

import { CorrelationIds } from './correlation-ids.js';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware<IncomingMessage, ServerResponse> {
  private readonly correlationIds = new CorrelationIds();

  public constructor(private readonly scope: CorrelationScope) {}

  public use(request: IncomingMessage, response: ServerResponse, next: () => void): void {
    const correlationId = this.correlationIds.assign(request, response);
    trace.getActiveSpan()?.setAttribute(CORRELATION_ID_ATTRIBUTE, correlationId);
    this.scope.run(correlationId, next);
  }
}
