import type { StaticEncode, TProperties, TSchema } from 'typebox';
import { Compile, type Validator } from 'typebox/compile';
import type { TLocalizedValidationError } from 'typebox/error';

import type { FieldIssue } from '../../errors/field-issue.js';
import { InvalidInput } from '../../errors/invalid-input.js';

export class CompiledSchema<T extends TSchema> {
  private readonly validator: Validator<TProperties, T>;

  public constructor(schema: T) {
    this.validator = Compile(schema);
  }

  public parse(value: unknown, code: string, message: string): StaticEncode<T, TProperties> {
    if (this.validator.Check(value)) {
      return value;
    }
    throw new InvalidInput(code, message, this.issuesOf(value));
  }

  private issuesOf(value: unknown): FieldIssue[] {
    return this.validator.Errors(value).flatMap((error) => this.toIssues(error));
  }

  private toIssues(error: TLocalizedValidationError): FieldIssue[] {
    if (error.keyword === 'required') {
      return error.params.requiredProperties.map((property) =>
        this.issue(`${error.instancePath}/${property}`, 'is required'),
      );
    }
    if (this.repeatsAdditionalPropertiesError(error)) {
      return [];
    }
    if (error.keyword === 'additionalProperties') {
      return error.params.additionalProperties.map((property) =>
        this.issue(`${error.instancePath}/${property}`, 'is not allowed'),
      );
    }
    return [this.issue(error.instancePath, error.message)];
  }

  private repeatsAdditionalPropertiesError(error: TLocalizedValidationError): boolean {
    return error.keyword === 'boolean' && error.schemaPath.endsWith('/additionalProperties');
  }

  private issue(instancePath: string, detail: string): FieldIssue {
    return { pointer: `#${instancePath}`, detail };
  }
}
