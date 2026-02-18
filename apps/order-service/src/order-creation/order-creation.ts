import {
  CancelCreateTicket,
  ConfirmCreateTicket,
  CreateTicket,
  ValidateOrderByConsumer,
  type TicketCommandPayload,
} from '@ftgo/contracts';
import { LocalAction, ParticipantCommand, SagaStep, type SagaDefinition } from '@ftgo/saga';
import { Injectable } from '@nestjs/common';

import { OrderId } from '../orders/entities/order-id.js';
import { OrderApproval } from '../orders/order-approval.js';

import { MissingTicket } from './errors/missing-ticket.js';
import { CREATE_ORDER_SAGA } from './order-creation.constants.js';
import { OrderCreationData } from './schemas/order-creation-data.schema.js';

@Injectable()
export class OrderCreation implements SagaDefinition<typeof OrderCreationData> {
  public readonly sagaType = CREATE_ORDER_SAGA;
  public readonly data = OrderCreationData;
  public readonly steps: ReadonlyArray<SagaStep<OrderCreationData>>;

  public constructor(approval: OrderApproval) {
    this.steps = [
      OrderCreation.rejection(approval),
      OrderCreation.consumerValidation(),
      OrderCreation.ticketCreation(),
      OrderCreation.ticketConfirmation(),
      OrderCreation.approval(approval),
    ];
  }

  private static rejection(approval: OrderApproval): SagaStep<OrderCreationData> {
    return SagaStep.compensateWith(
      new LocalAction<OrderCreationData>(async (data) => approval.reject(OrderId.of(data.orderId))),
    );
  }

  private static consumerValidation(): SagaStep<OrderCreationData> {
    return SagaStep.invoke(
      new ParticipantCommand(ValidateOrderByConsumer, (data: OrderCreationData) => ({
        consumerId: data.consumerId,
        orderId: data.orderId,
        orderTotal: data.orderTotal,
      })),
    );
  }

  private static ticketCreation(): SagaStep<OrderCreationData> {
    return SagaStep.invoke(
      new ParticipantCommand(
        CreateTicket,
        (data: OrderCreationData) => ({
          orderId: data.orderId,
          restaurantId: data.restaurantId,
          ticketDetails: data.ticketDetails,
        }),
        (data, reply) => ({ ...data, ticketId: reply.ticketId }),
      ),
    ).withCompensation(
      new ParticipantCommand(CancelCreateTicket, (data: OrderCreationData) =>
        OrderCreation.ticketOf(data),
      ),
    );
  }

  private static ticketConfirmation(): SagaStep<OrderCreationData> {
    return SagaStep.invoke(
      new ParticipantCommand(ConfirmCreateTicket, (data: OrderCreationData) =>
        OrderCreation.ticketOf(data),
      ),
    ).retriable();
  }

  private static approval(approval: OrderApproval): SagaStep<OrderCreationData> {
    return SagaStep.invoke(
      new LocalAction<OrderCreationData>(async (data) =>
        approval.approve(OrderId.of(data.orderId)),
      ),
    );
  }

  private static ticketOf(data: OrderCreationData): TicketCommandPayload {
    if (data.ticketId === undefined) {
      throw new MissingTicket(data.orderId);
    }
    return { ticketId: data.ticketId };
  }
}
