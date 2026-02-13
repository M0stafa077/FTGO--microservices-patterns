import { CompiledSchema } from '@ftgo/common/infrastructure';
import { Injectable } from '@nestjs/common';
import type { TSchema } from 'typebox';

@Injectable()
export class PayloadSchemas {
  private readonly compiled = new Map<TSchema, CompiledSchema<TSchema>>();

  public validate(schema: TSchema, payload: unknown): void {
    this.compiledFor(schema).parse(payload, 'message.invalid', 'The message payload is not valid.');
  }

  private compiledFor(schema: TSchema): CompiledSchema<TSchema> {
    const known = this.compiled.get(schema);
    if (known !== undefined) {
      return known;
    }
    const compiled = new CompiledSchema(schema);
    this.compiled.set(schema, compiled);
    return compiled;
  }
}
