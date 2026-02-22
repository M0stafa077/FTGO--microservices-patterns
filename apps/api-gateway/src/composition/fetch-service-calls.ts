import {
  CORRELATION_ID_HEADER,
  CorrelationScope,
  type CompiledSchema,
} from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';
import type { StaticEncode, TProperties, TSchema } from 'typebox';

import type { ServiceName } from '../config/service-name.js';
import { ServicesConfig } from '../config/services.config.js';
import { ServiceUnreachable } from '../routing/errors/service-unreachable.js';

import { NOT_FOUND_STATUS, OK_STATUS } from './composition.constants.js';
import type { ServiceCalls } from './service-calls.js';

@Injectable()
export class FetchServiceCalls implements ServiceCalls {
  public constructor(
    @Inject(ServicesConfig) private readonly services: ServicesConfig,
    private readonly correlationScope: CorrelationScope,
  ) {}

  public async find<T extends TSchema>(
    service: ServiceName,
    path: string,
    authorization: string,
    schema: CompiledSchema<T>,
  ): Promise<StaticEncode<T, TProperties> | undefined> {
    const answer = await this.send(service, path, authorization);
    if (answer.status === NOT_FOUND_STATUS) {
      await answer.body?.cancel();
      return undefined;
    }
    if (answer.status !== OK_STATUS) {
      await answer.body?.cancel();
      throw new ServiceUnreachable(service, `answered ${String(answer.status)}`);
    }
    return this.parse(service, await this.bodyOf(service, answer), schema);
  }

  private async send(
    service: ServiceName,
    path: string,
    authorization: string,
  ): Promise<globalThis.Response> {
    try {
      return await fetch(this.services.urlOf(service, path), {
        headers: this.headersOf(authorization),
        redirect: 'manual',
        signal: AbortSignal.timeout(this.services.compositionTimeout.toMilliseconds()),
      });
    } catch (error) {
      throw new ServiceUnreachable(service, 'did not answer', { cause: error });
    }
  }

  private async bodyOf(service: ServiceName, answer: globalThis.Response): Promise<unknown> {
    try {
      const body: unknown = await answer.json();
      return body;
    } catch (error) {
      throw new ServiceUnreachable(service, 'sent an unreadable body', { cause: error });
    }
  }

  private parse<T extends TSchema>(
    service: ServiceName,
    body: unknown,
    schema: CompiledSchema<T>,
  ): StaticEncode<T, TProperties> {
    try {
      return schema.parse(body, 'gateway.unexpected_response', 'The response body is not valid.');
    } catch (error) {
      throw new ServiceUnreachable(service, 'sent an unexpected body', { cause: error });
    }
  }

  private headersOf(authorization: string): Headers {
    const headers = new Headers({ authorization, accept: 'application/json' });
    const correlationId = this.correlationScope.current();
    if (correlationId !== undefined) {
      headers.set(CORRELATION_ID_HEADER, correlationId);
    }
    return headers;
  }
}
