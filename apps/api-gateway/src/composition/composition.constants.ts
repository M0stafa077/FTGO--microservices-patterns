import { Duration } from '@ftgo/common';

export const OK_STATUS = 200;
export const NOT_FOUND_STATUS = 404;
export const CIRCUIT_FAILURE_THRESHOLD = 5;
export const CIRCUIT_OPEN_DURATION: Duration = Duration.ofSeconds(10);
