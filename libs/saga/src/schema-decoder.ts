import type { Static, TSchema } from 'typebox';

export interface SchemaDecoder {
  decode<Schema extends TSchema>(schema: Schema, value: unknown): Static<Schema>;
}
