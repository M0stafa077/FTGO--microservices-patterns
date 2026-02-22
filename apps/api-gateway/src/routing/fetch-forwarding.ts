import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { CORRELATION_ID_HEADER, CorrelationIds } from '@ftgo/common/infrastructure';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

import type { ServiceName } from '../config/service-name.js';
import { ServicesConfig } from '../config/services.config.js';

import { ServiceUnreachable } from './errors/service-unreachable.js';
import type { Forwarding } from './forwarding.js';
import { FORWARDED_REQUEST_HEADERS, RETURNED_RESPONSE_HEADERS } from './routing.constants.js';

@Injectable()
export class FetchForwarding implements Forwarding {
  private readonly logger = new Logger(FetchForwarding.name);
  private readonly correlationIds = new CorrelationIds();

  public constructor(@Inject(ServicesConfig) private readonly services: ServicesConfig) {}

  public async forward(service: ServiceName, request: Request, response: Response): Promise<void> {
    const answer = await this.send(service, request);
    response.status(answer.status);
    for (const name of RETURNED_RESPONSE_HEADERS) {
      const value = answer.headers.get(name);
      if (value !== null) {
        response.setHeader(name, value);
      }
    }
    await this.relay(service, answer.body, response);
  }

  private async send(service: ServiceName, request: Request): Promise<globalThis.Response> {
    try {
      return await fetch(this.services.urlOf(service, request.originalUrl), {
        method: request.method,
        headers: this.headersOf(request),
        body: this.hasBody(request) ? Readable.toWeb(request) : null,
        duplex: 'half',
        redirect: 'manual',
        signal: AbortSignal.timeout(this.services.forwardTimeout.toMilliseconds()),
      });
    } catch (error) {
      throw new ServiceUnreachable(service, 'did not answer', { cause: error });
    }
  }

  private hasBody(request: Request): boolean {
    const length = Number(request.headers['content-length'] ?? '0');
    return request.headers['transfer-encoding'] !== undefined || length > 0;
  }

  private headersOf(request: Request): Headers {
    const headers = new Headers();
    for (const name of FORWARDED_REQUEST_HEADERS) {
      const value = request.headers[name];
      if (typeof value === 'string') {
        headers.set(name, value);
      }
    }
    const correlationId = this.correlationIds.of(request);
    if (correlationId !== undefined) {
      headers.set(CORRELATION_ID_HEADER, correlationId);
    }
    return headers;
  }

  private async relay(
    service: ServiceName,
    body: ReadableStream<Uint8Array> | null,
    response: Response,
  ): Promise<void> {
    if (body === null) {
      response.end();
      return;
    }
    try {
      await pipeline(Readable.from(body), response);
    } catch (error) {
      this.logger.warn({ err: error, service }, 'The response stream was cut.');
    }
  }
}
