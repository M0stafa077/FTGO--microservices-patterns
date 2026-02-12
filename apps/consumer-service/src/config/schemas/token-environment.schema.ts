import { Type, type Static } from 'typebox';

export const TokenEnvironment = Type.Object({
  JWT_ISSUER: Type.String({ minLength: 1, maxLength: 256, default: 'ftgo-consumer-service' }),
  JWT_AUDIENCE: Type.String({ minLength: 1, maxLength: 256, default: 'ftgo' }),
  JWT_SIGNING_KEY: Type.String({ minLength: 1, maxLength: 4096 }),
  ACCESS_TOKEN_TTL_SECONDS: Type.Integer({ minimum: 60, maximum: 3_600, default: 900 }),
  SESSION_TTL_DAYS: Type.Integer({ minimum: 1, maximum: 90, default: 30 }),
});
export type TokenEnvironment = Static<typeof TokenEnvironment>;
