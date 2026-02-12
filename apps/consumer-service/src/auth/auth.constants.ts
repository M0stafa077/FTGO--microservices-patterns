import { Algorithm, type Options } from '@node-rs/argon2';

export const REFRESH_TOKEN_SECRET_BYTES = 32;
export const REFRESH_TOKEN_SECRET_FORMAT = /^[A-Za-z0-9_-]{43}$/;
export const REFRESH_TOKEN_SEPARATOR = '.';
export const BEARER_TOKEN_FORMAT = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/;
export const SIGNING_ALGORITHM = 'EdDSA';
export const ACCESS_TOKEN_TYPE = 'at+jwt';
export const SESSION_CLAIM = 'sid';
export const ACCESS_TOKEN_CLOCK_TOLERANCE_SECONDS = 5;
export const ARGON2_OPTIONS: Options = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};
export const DECOY_PASSWORD_BYTES = 32;
