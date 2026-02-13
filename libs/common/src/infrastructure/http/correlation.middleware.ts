import type { IncomingMessage, ServerResponse } from 'node:http';

import { Injectable, type NestMiddleware } from '@nestjs/common';

import { CorrelationScope } from '../logging/correlation-scope.js';

import { CorrelationIds } from './correlation-ids.js';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware<IncomingMessage, ServerResponse> {
  private readonly correlationIds = new CorrelationIds();

  public constructor(private readonly scope: CorrelationScope) {}

  public use(request: IncomingMessage, response: ServerResponse, next: () => void): void {
    this.scope.run(this.correlationIds.assign(request, response), next);
  }
}
