import { Role } from './identity/role.js';

export const REDACTED = '[redacted]';
export const UUID_FORMAT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const MILLISECONDS_PER_SECOND = 1_000;
export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_DAY = 86_400;
export const CURRENCY_FORMAT = /^[A-Z]{3}$/;
export const ADDRESS_LINE_MAX_LENGTH = 100;
export const ZIP_CODE_MAX_LENGTH = 20;
export const ROLES: ReadonlyMap<string, Role> = new Map(
  Object.values(Role).map((role) => [role, role]),
);
