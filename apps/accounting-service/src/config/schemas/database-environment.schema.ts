import { Type, type Static } from 'typebox';

export const DatabaseEnvironment = Type.Object({
  ACCOUNTING_DATABASE_URL: Type.String({ pattern: '^postgres(ql)?://', maxLength: 2048 }),
  ACCOUNTING_DATABASE_POOL_SIZE: Type.Integer({ minimum: 1, maximum: 100, default: 10 }),
});
export type DatabaseEnvironment = Static<typeof DatabaseEnvironment>;
