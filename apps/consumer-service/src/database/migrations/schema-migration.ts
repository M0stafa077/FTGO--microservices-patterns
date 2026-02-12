import type { Kysely } from 'kysely';

export interface SchemaMigration {
  up(database: Kysely<unknown>): Promise<void>;
  down(database: Kysely<unknown>): Promise<void>;
}
