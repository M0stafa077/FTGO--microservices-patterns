import { Type, type Static } from 'typebox';

export const TracingEnvironment = Type.Object({
  TRACING_ENDPOINT: Type.String({
    pattern: '^https?://',
    maxLength: 2048,
    default: 'http://localhost:4318/v1/traces',
  }),
  TRACING_SAMPLE_RATIO: Type.Number({ minimum: 0, maximum: 1, default: 1 }),
});
export type TracingEnvironment = Static<typeof TracingEnvironment>;
