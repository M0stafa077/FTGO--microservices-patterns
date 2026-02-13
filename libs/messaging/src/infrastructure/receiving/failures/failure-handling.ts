import type { Disposition } from '../dispositions/disposition.js';

import type { Failure } from './failure.js';

export interface FailureHandling {
  handle(failure: Failure): Promise<Disposition>;
}
