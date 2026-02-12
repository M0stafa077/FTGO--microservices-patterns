import type { StaticEncode, TProperties, TSchema } from 'typebox';
import { Value } from 'typebox/value';

import { CompiledSchema } from './compiled-schema.js';

export class Environment {
  public constructor(private readonly variables: Readonly<Record<string, string | undefined>>) {}

  public read<T extends TSchema>(schema: T): StaticEncode<T, TProperties> {
    const withDefaults = Value.Default(schema, { ...this.variables });
    const converted = Value.Convert(schema, withDefaults);
    return new CompiledSchema(schema).parse(
      converted,
      'configuration.invalid',
      'The environment configuration is not valid. See `issues` for each variable.',
    );
  }
}
