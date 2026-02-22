import { Type, type Static } from 'typebox';

export const AccountIdParameter = Type.String({ format: 'uuid' });
export type AccountIdParameter = Static<typeof AccountIdParameter>;
