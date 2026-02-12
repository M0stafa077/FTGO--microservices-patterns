export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const CORRELATION_ID_FORMAT = /^[A-Za-z0-9._-]{1,128}$/;
export const FIRST_SERVER_ERROR_STATUS = 500;
export const UNAUTHORIZED_STATUS = 401;
export const UNIQUE_VIOLATION_CODE = '23505';
export const TRANSIENT_SQL_STATES = /^(08|53|57P)/;
export const TRANSIENT_NETWORK_CODES: ReadonlySet<string> = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EPIPE',
]);
export const TRANSIENT_CONNECTION_MESSAGES =
  /timeout exceeded when trying to connect|Connection terminated/i;
