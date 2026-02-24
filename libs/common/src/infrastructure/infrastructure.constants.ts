export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const CORRELATION_ID_ATTRIBUTE = 'ftgo.correlation_id';
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
export const ALL_ROUTES = '{*path}';
export const BEARER_TOKEN_FORMAT = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/;
export const ACCESS_TOKEN_ALGORITHM = 'EdDSA';
export const ACCESS_TOKEN_TYPE = 'at+jwt';
export const ROLE_CLAIM = 'role';
export const ACCESS_TOKEN_CLOCK_TOLERANCE_SECONDS = 5;
export const JWKS_TIMEOUT_MS = 2_000;
export const TOKEN_REJECTION_CODES: ReadonlySet<string> = new Set([
  'ERR_JWT_EXPIRED',
  'ERR_JWT_CLAIM_VALIDATION_FAILED',
  'ERR_JWT_INVALID',
  'ERR_JWS_INVALID',
  'ERR_JWS_SIGNATURE_VERIFICATION_FAILED',
  'ERR_JOSE_ALG_NOT_ALLOWED',
  'ERR_JOSE_NOT_SUPPORTED',
  'ERR_JWKS_NO_MATCHING_KEY',
  'ERR_JWKS_MULTIPLE_MATCHING_KEYS',
]);
