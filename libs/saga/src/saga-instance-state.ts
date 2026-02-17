import type { Uuid } from '@ftgo/common';

import type { SagaStatus } from './saga-status.js';

export interface SagaInstanceState {
  readonly id: Uuid;
  readonly sagaType: string;
  readonly status: SagaStatus;
  readonly currentStep: number;
  readonly isCompensating: boolean;
  readonly data: unknown;
  readonly awaitedMessageId: string | undefined;
  readonly failureReason: string | undefined;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}
