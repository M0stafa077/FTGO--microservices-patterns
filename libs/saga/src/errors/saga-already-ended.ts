import { RuleViolation, type Uuid } from '@ftgo/common';

import type { SagaStatus } from '../saga-status.js';

export class SagaAlreadyEnded extends RuleViolation {
  public constructor(id: Uuid, status: SagaStatus) {
    super('saga.already_ended', `Saga ${id.toString()} has already ended as ${status}.`);
  }
}
