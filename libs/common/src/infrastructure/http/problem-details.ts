import type { FieldIssue } from '../../errors/field-issue.js';

export interface ProblemDetails {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
  readonly instance: string;
  readonly code: string;
  readonly correlationId: string | undefined;
  readonly errors: ReadonlyArray<FieldIssue> | undefined;
}
