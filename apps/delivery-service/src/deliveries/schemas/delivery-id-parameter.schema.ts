import { Type, type Static } from 'typebox';

export const DeliveryIdParameter = Type.String({ format: 'uuid' });
export type DeliveryIdParameter = Static<typeof DeliveryIdParameter>;
