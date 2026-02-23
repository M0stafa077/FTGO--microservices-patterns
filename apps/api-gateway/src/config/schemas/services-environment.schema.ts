import { Type, type Static } from 'typebox';

export const ServicesEnvironment = Type.Object({
  CONSUMER_SERVICE_URL: Type.String({
    pattern: '^https?://',
    maxLength: 2048,
    default: 'http://localhost:8081',
  }),
  ORDER_SERVICE_URL: Type.String({
    pattern: '^https?://',
    maxLength: 2048,
    default: 'http://localhost:8082',
  }),
  KITCHEN_SERVICE_URL: Type.String({
    pattern: '^https?://',
    maxLength: 2048,
    default: 'http://localhost:8083',
  }),
  RESTAURANT_SERVICE_URL: Type.String({
    pattern: '^https?://',
    maxLength: 2048,
    default: 'http://localhost:8084',
  }),
  ACCOUNTING_SERVICE_URL: Type.String({
    pattern: '^https?://',
    maxLength: 2048,
    default: 'http://localhost:8085',
  }),
  ORDER_HISTORY_SERVICE_URL: Type.String({
    pattern: '^https?://',
    maxLength: 2048,
    default: 'http://localhost:8086',
  }),
  DELIVERY_SERVICE_URL: Type.String({
    pattern: '^https?://',
    maxLength: 2048,
    default: 'http://localhost:8089',
  }),
  API_GATEWAY_FORWARD_TIMEOUT_MS: Type.Integer({ minimum: 100, maximum: 60_000, default: 10_000 }),
  API_GATEWAY_COMPOSITION_TIMEOUT_MS: Type.Integer({
    minimum: 100,
    maximum: 30_000,
    default: 2_000,
  }),
});
export type ServicesEnvironment = Static<typeof ServicesEnvironment>;
