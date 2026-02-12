import type { PipeTransform } from '@nestjs/common';
import type { StaticEncode, TProperties, TSchema } from 'typebox';

import { CompiledSchema } from '../config/compiled-schema.js';

export class SchemaValidationPipe<T extends TSchema> implements PipeTransform<
  unknown,
  StaticEncode<T, TProperties>
> {
  private readonly schema: CompiledSchema<T>;

  public constructor(schema: T) {
    this.schema = new CompiledSchema(schema);
  }

  public transform(value: unknown): StaticEncode<T, TProperties> {
    return this.schema.parse(value, 'request.invalid', 'The request is not valid.');
  }
}
