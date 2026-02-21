import { Type, type Static } from 'typebox';

export const CourierIdParameter = Type.String({ format: 'uuid' });
export type CourierIdParameter = Static<typeof CourierIdParameter>;
