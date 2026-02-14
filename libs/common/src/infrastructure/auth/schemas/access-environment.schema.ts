import { Type, type Static } from 'typebox';

export const AccessEnvironment = Type.Object({
  JWT_ISSUER: Type.String({ minLength: 1, maxLength: 256, default: 'ftgo-consumer-service' }),
  JWT_AUDIENCE: Type.String({ minLength: 1, maxLength: 256, default: 'ftgo' }),
  AUTH_JWKS_URL: Type.String({
    pattern: '^https?://',
    maxLength: 2048,
    default: 'http://localhost:8081/.well-known/jwks.json',
  }),
});
export type AccessEnvironment = Static<typeof AccessEnvironment>;
