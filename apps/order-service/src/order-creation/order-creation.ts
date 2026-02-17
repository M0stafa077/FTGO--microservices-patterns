import { ValidateOrderByConsumer } from '@ftgo/contracts';
import { LocalAction, ParticipantCommand, SagaStep, type SagaDefinition } from '@ftgo/saga';
import { Injectable } from '@nestjs/common';

import { OrderId } from '../orders/entities/order-id.js';
import { OrderApproval } from '../orders/order-approval.js';

import { CREATE_ORDER_SAGA } from './order-creation.constants.js';
import { OrderCreationData } from './schemas/order-creation-data.schema.js';

@Injectable()
export class OrderCreation implements SagaDefinition<typeof OrderCreationData> {
  public readonly sagaType = CREATE_ORDER_SAGA;
  public readonly data = OrderCreationData;
  public readonly steps: ReadonlyArray<SagaStep<OrderCreationData>>;

  public constructor(approval: OrderApproval) {
    this.steps = [
      SagaStep.compensateWith(
        new LocalAction<OrderCreationData>(async (data) =>
          approval.reject(OrderId.of(data.orderId)),
        ),
      ),
      SagaStep.invoke(
        new ParticipantCommand(ValidateOrderByConsumer, (data: OrderCreationData) => ({
          consumerId: data.consumerId,
          orderId: data.orderId,
          orderTotal: data.orderTotal,
        })),
      ),
      SagaStep.invoke(
        new LocalAction<OrderCreationData>(async (data) =>
          approval.approve(OrderId.of(data.orderId)),
        ),
      ),
    ];
  }
}
