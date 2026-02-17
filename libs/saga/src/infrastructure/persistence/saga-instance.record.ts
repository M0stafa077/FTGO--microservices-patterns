import { InvalidInput, Uuid } from '@ftgo/common';
import type { Insertable, Selectable } from 'kysely';

import { SagaInstance } from '../../saga-instance.js';
import type { SagaStatus } from '../../saga-status.js';
import { SAGA_STATUSES } from '../infrastructure.constants.js';

import type { SagaInstancesTable } from './tables/saga-instances.table.js';

export class SagaInstanceRecord {
  private constructor(private readonly row: Selectable<SagaInstancesTable>) {}

  public static fromRow(row: Selectable<SagaInstancesTable>): SagaInstanceRecord {
    return new SagaInstanceRecord(row);
  }

  public static rowOf(instance: SagaInstance): Insertable<SagaInstancesTable> {
    const state = instance.snapshot();
    return {
      id: state.id.toString(),
      sagaType: state.sagaType,
      status: state.status,
      currentStep: state.currentStep,
      isCompensating: state.isCompensating,
      data: JSON.stringify(state.data),
      awaitedMessageId: state.awaitedMessageId ?? null,
      failureReason: state.failureReason ?? null,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
      version: state.version,
    };
  }

  public toInstance(): SagaInstance {
    return SagaInstance.restore({
      id: Uuid.of(this.row.id),
      sagaType: this.row.sagaType,
      status: this.status(),
      currentStep: this.row.currentStep,
      isCompensating: this.row.isCompensating,
      data: this.row.data,
      awaitedMessageId: this.row.awaitedMessageId ?? undefined,
      failureReason: this.row.failureReason ?? undefined,
      createdAt: this.row.createdAt,
      updatedAt: this.row.updatedAt,
      version: this.row.version,
    });
  }

  private status(): SagaStatus {
    const status = SAGA_STATUSES.get(this.row.status);
    if (status === undefined) {
      throw new InvalidInput('saga.unknown_status', `Unknown saga status "${this.row.status}".`);
    }
    return status;
  }
}
