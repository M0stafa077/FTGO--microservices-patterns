import { STATUS_CODES } from 'node:http';

import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { ErrorCategory } from '../../errors/error-category.js';
import { FtgoError } from '../../errors/ftgo-error.js';
import { InvalidInput } from '../../errors/invalid-input.js';
import { FIRST_SERVER_ERROR_STATUS, UNAUTHORIZED_STATUS } from '../infrastructure.constants.js';

import { CorrelationIds } from './correlation-ids.js';
import type { ProblemDetails } from './problem-details.js';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);
  private readonly correlationIds = new CorrelationIds();

  public catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    this.correlationIds.assign(request, response);
    const problem = this.toProblem(exception, request);

    if (problem.status >= FIRST_SERVER_ERROR_STATUS) {
      this.logger.error({ err: exception, code: problem.code }, problem.title);
    }
    if (problem.status === UNAUTHORIZED_STATUS) {
      response.setHeader('WWW-Authenticate', 'Bearer');
    }
    response.status(problem.status).type('application/problem+json').json(problem);
  }

  private toProblem(exception: unknown, request: Request): ProblemDetails {
    if (exception instanceof FtgoError) {
      const status = this.statusOf(exception.category);
      const detail =
        status >= FIRST_SERVER_ERROR_STATUS
          ? 'A dependency is temporarily unavailable. Retry later.'
          : exception.message;
      const errors =
        exception instanceof InvalidInput && exception.issues.length > 0
          ? exception.issues
          : undefined;
      return this.problem(request, status, exception.code, detail, errors);
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return this.problem(request, status, `http.${String(status)}`, exception.message, undefined);
    }
    return this.problem(
      request,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'internal_error',
      'An unexpected error occurred.',
      undefined,
    );
  }

  private problem(
    request: Request,
    status: number,
    code: string,
    detail: string,
    errors: ProblemDetails['errors'],
  ): ProblemDetails {
    return {
      type: `urn:ftgo:problem:${code}`,
      title: STATUS_CODES[status] ?? 'Error',
      status,
      detail,
      instance: request.originalUrl,
      code,
      correlationId: this.correlationIds.of(request),
      errors,
    };
  }

  private statusOf(category: ErrorCategory): number {
    switch (category) {
      case ErrorCategory.InvalidInput:
        return HttpStatus.BAD_REQUEST;
      case ErrorCategory.Unauthenticated:
        return HttpStatus.UNAUTHORIZED;
      case ErrorCategory.Forbidden:
        return HttpStatus.FORBIDDEN;
      case ErrorCategory.NotFound:
        return HttpStatus.NOT_FOUND;
      case ErrorCategory.Conflict:
        return HttpStatus.CONFLICT;
      case ErrorCategory.RuleViolation:
        return HttpStatus.UNPROCESSABLE_ENTITY;
      case ErrorCategory.Unavailable:
        return HttpStatus.SERVICE_UNAVAILABLE;
      default: {
        const unreachable: never = category;
        return unreachable;
      }
    }
  }
}
