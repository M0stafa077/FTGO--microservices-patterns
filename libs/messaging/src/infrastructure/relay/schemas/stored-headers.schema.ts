import { Type, type Static } from 'typebox';

export const StoredHeaders = Type.Record(
  Type.String({ minLength: 1, maxLength: 64 }),
  Type.String({ maxLength: 2048 }),
);
export type StoredHeaders = Static<typeof StoredHeaders>;
