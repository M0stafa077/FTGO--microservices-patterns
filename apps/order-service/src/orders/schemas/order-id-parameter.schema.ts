import { Type, type Static } from 'typebox';

export const OrderIdParameter = Type.String({ format: 'uuid' });
export type OrderIdParameter = Static<typeof OrderIdParameter>;
