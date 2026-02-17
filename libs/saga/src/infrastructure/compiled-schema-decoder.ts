import { CompiledSchema } from '@ftgo/common/infrastructure';
import { Injectable } from '@nestjs/common';
import type { Static, TSchema } from 'typebox';
import { Value } from 'typebox/value';

import type { SchemaDecoder } from '../schema-decoder.js';

@Injectable()
export class CompiledSchemaDecoder implements SchemaDecoder {
  public decode<Schema extends TSchema>(schema: Schema, value: unknown): Static<Schema> {
    if (Value.Check(schema, value)) {
      return value;
    }
    throw new CompiledSchema(schema).rejectionOf(
      value,
      'saga.invalid_data',
      'Saga data or a reply payload does not match its schema.',
    );
  }
}
