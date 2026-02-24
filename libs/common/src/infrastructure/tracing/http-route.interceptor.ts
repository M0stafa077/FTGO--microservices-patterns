import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { context } from '@opentelemetry/api';
import { getRPCMetadata, RPCType } from '@opentelemetry/core';
import type { Request } from 'express';
import type { Observable } from 'rxjs';

@Injectable()
export class HttpRouteInterceptor implements NestInterceptor {
  public intercept(execution: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = getRPCMetadata(context.active());
    const route = this.routeOf(execution.switchToHttp().getRequest<Request>());
    if (metadata?.type === RPCType.HTTP && route !== undefined) {
      metadata.route = route;
    }
    return next.handle();
  }

  private routeOf(request: Request): string | undefined {
    const route: unknown = request.route;
    if (typeof route !== 'object' || route === null || !('path' in route)) {
      return undefined;
    }
    return typeof route.path === 'string' ? route.path : undefined;
  }
}
