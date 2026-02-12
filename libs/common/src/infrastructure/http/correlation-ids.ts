import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { CORRELATION_ID_FORMAT, CORRELATION_ID_HEADER } from '../infrastructure.constants.js';

export class CorrelationIds {
  public assign(request: IncomingMessage, response: ServerResponse): string {
    const id = this.of(request) ?? randomUUID();
    request.headers[CORRELATION_ID_HEADER] = id;
    response.setHeader(CORRELATION_ID_HEADER, id);
    return id;
  }

  public of(request: IncomingMessage): string | undefined {
    const value = request.headers[CORRELATION_ID_HEADER];
    if (typeof value !== 'string' || !CORRELATION_ID_FORMAT.test(value)) {
      return undefined;
    }
    return value;
  }
}
