import { Type, type Static } from 'typebox';

export const AppEnvironment = Type.Object({
  ORDER_SERVICE_PORT: Type.Integer({ minimum: 1, maximum: 65_535, default: 8082 }),
  LOG_LEVEL: Type.Union(
    [
      Type.Literal('fatal'),
      Type.Literal('error'),
      Type.Literal('warn'),
      Type.Literal('info'),
      Type.Literal('debug'),
      Type.Literal('trace'),
    ],
    { default: 'info' },
  ),
});
export type AppEnvironment = Static<typeof AppEnvironment>;
