import {
  BeginCancelTicket,
  ConfirmCancelTicket,
  ReverseAuthorization,
  UndoBeginCancelTicket,
  type TicketCommandPayload,
} from '@ftgo/contracts';
import { LocalAction, ParticipantCommand, SagaStep, type SagaDefinition } from '@ftgo/saga';
import { Injectable } from '@nestjs/common';

import { OrderId } from '../orders/entities/order-id.js';
import { OrderTransitions } from '../orders/order-transitions.js';

import { CANCEL_ORDER_SAGA } from './order-cancellation.constants.js';
import { OrderCancellationData } from './schemas/order-cancellation-data.schema.js';

@Injectable()
export class OrderCancellation implements SagaDefinition<typeof OrderCancellationData> {
  public readonly sagaType = CANCEL_ORDER_SAGA;
  public readonly data = OrderCancellationData;
  public readonly steps: ReadonlyArray<SagaStep<OrderCancellationData>>;

  public constructor(transitions: OrderTransitions) {
    this.steps = [
      OrderCancellation.cancelUndo(transitions),
      OrderCancellation.ticketCancelBegin(),
      OrderCancellation.authorizationReversal(),
      OrderCancellation.ticketCancelConfirmation(),
      OrderCancellation.cancelConfirmation(transitions),
    ];
  }

  private static cancelUndo(transitions: OrderTransitions): SagaStep<OrderCancellationData> {
    return SagaStep.compensateWith(
      new LocalAction<OrderCancellationData>(async (data) =>
        transitions.undoCancel(OrderId.of(data.orderId)),
      ),
    );
  }

  private static ticketCancelBegin(): SagaStep<OrderCancellationData> {
    return SagaStep.invoke(
      new ParticipantCommand(BeginCancelTicket, (data: OrderCancellationData) =>
        OrderCancellation.ticketOf(data),
      ),
    ).withCompensation(
      new ParticipantCommand(UndoBeginCancelTicket, (data: OrderCancellationData) =>
        OrderCancellation.ticketOf(data),
      ),
    );
  }

  private static authorizationReversal(): SagaStep<OrderCancellationData> {
    return SagaStep.invoke(
      new ParticipantCommand(ReverseAuthorization, (data: OrderCancellationData) => ({
        consumerId: data.consumerId,
        orderId: data.orderId,
        orderTotal: data.orderTotal,
      })),
    );
  }

  private static ticketCancelConfirmation(): SagaStep<OrderCancellationData> {
    return SagaStep.invoke(
      new ParticipantCommand(ConfirmCancelTicket, (data: OrderCancellationData) =>
        OrderCancellation.ticketOf(data),
      ),
    ).retriable();
  }

  private static cancelConfirmation(
    transitions: OrderTransitions,
  ): SagaStep<OrderCancellationData> {
    return SagaStep.invoke(
      new LocalAction<OrderCancellationData>(async (data) =>
        transitions.confirmCancel(OrderId.of(data.orderId)),
      ),
    ).retriable();
  }

  private static ticketOf(data: OrderCancellationData): TicketCommandPayload {
    return { ticketId: data.orderId };
  }
}
