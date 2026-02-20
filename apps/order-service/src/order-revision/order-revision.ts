import { Quantity } from '@ftgo/common';
import {
  BeginReviseTicket,
  ConfirmReviseTicket,
  ReviseAuthorization,
  UndoBeginReviseTicket,
  type TicketRevisionPayload,
} from '@ftgo/contracts';
import { LocalAction, ParticipantCommand, SagaStep, type SagaDefinition } from '@ftgo/saga';
import { Injectable } from '@nestjs/common';

import { OrderId } from '../orders/entities/order-id.js';
import { RequestedLineItem } from '../orders/entities/requested-line-item.js';
import { OrderTransitions } from '../orders/order-transitions.js';
import { MenuItemId } from '../restaurants/entities/menu-item-id.js';

import { REVISE_ORDER_SAGA } from './order-revision.constants.js';
import { OrderRevisionData } from './schemas/order-revision-data.schema.js';

@Injectable()
export class OrderRevision implements SagaDefinition<typeof OrderRevisionData> {
  public readonly sagaType = REVISE_ORDER_SAGA;
  public readonly data = OrderRevisionData;
  public readonly steps: ReadonlyArray<SagaStep<OrderRevisionData>>;

  public constructor(transitions: OrderTransitions) {
    this.steps = [
      OrderRevision.revisionUndo(transitions),
      OrderRevision.ticketRevisionBegin(),
      OrderRevision.authorizationRevision(),
      OrderRevision.ticketRevisionConfirmation(),
      OrderRevision.revisionConfirmation(transitions),
    ];
  }

  private static revisionUndo(transitions: OrderTransitions): SagaStep<OrderRevisionData> {
    return SagaStep.compensateWith(
      new LocalAction<OrderRevisionData>(async (data) =>
        transitions.undoRevision(OrderId.of(data.orderId)),
      ),
    );
  }

  private static ticketRevisionBegin(): SagaStep<OrderRevisionData> {
    return SagaStep.invoke(
      new ParticipantCommand(BeginReviseTicket, (data: OrderRevisionData) =>
        OrderRevision.ticketRevisionOf(data),
      ),
    ).withCompensation(
      new ParticipantCommand(UndoBeginReviseTicket, (data: OrderRevisionData) => ({
        ticketId: data.orderId,
      })),
    );
  }

  private static authorizationRevision(): SagaStep<OrderRevisionData> {
    return SagaStep.invoke(
      new ParticipantCommand(ReviseAuthorization, (data: OrderRevisionData) => ({
        consumerId: data.consumerId,
        orderId: data.orderId,
        orderTotal: data.revisedOrderTotal,
      })),
    );
  }

  private static ticketRevisionConfirmation(): SagaStep<OrderRevisionData> {
    return SagaStep.invoke(
      new ParticipantCommand(ConfirmReviseTicket, (data: OrderRevisionData) =>
        OrderRevision.ticketRevisionOf(data),
      ),
    ).retriable();
  }

  private static revisionConfirmation(transitions: OrderTransitions): SagaStep<OrderRevisionData> {
    return SagaStep.invoke(
      new LocalAction<OrderRevisionData>(async (data) =>
        transitions.confirmRevision(OrderId.of(data.orderId), OrderRevision.revisionsOf(data)),
      ),
    ).retriable();
  }

  private static ticketRevisionOf(data: OrderRevisionData): TicketRevisionPayload {
    return { ticketId: data.orderId, revisedLineItems: data.revisedLineItems };
  }

  private static revisionsOf(data: OrderRevisionData): ReadonlyArray<RequestedLineItem> {
    return data.revisedLineItems.map(
      (item) => new RequestedLineItem(MenuItemId.of(item.menuItemId), Quantity.of(item.quantity)),
    );
  }
}
