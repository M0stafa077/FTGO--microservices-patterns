import { Money, TicketDetails } from '@ftgo/contracts';
import { Type, type Static } from 'typebox';

export const OrderCreationData = Type.Object(
  {
    orderId: Type.String({ format: 'uuid' }),
    consumerId: Type.String({ format: 'uuid' }),
    restaurantId: Type.String({ format: 'uuid' }),
    ticketDetails: TicketDetails,
    orderTotal: Money,
    ticketId: Type.Optional(Type.String({ format: 'uuid' })),
  },
  { additionalProperties: false },
);
export type OrderCreationData = Static<typeof OrderCreationData>;
