import { ReplyOutcome } from '@ftgo/messaging';

import { SagaStatus } from '../saga-status.js';

export const SAGA_REPLIES_SUFFIX = '.saga-replies';
export const SAGA_STATUSES: ReadonlyMap<string, SagaStatus> = new Map(
  Object.values(SagaStatus).map((status) => [status, status]),
);
export const REPLY_OUTCOMES: ReadonlyMap<string, ReplyOutcome> = new Map(
  Object.values(ReplyOutcome).map((outcome) => [outcome, outcome]),
);
