import type { Environment } from '../config/environment.js';

import { AccessEnvironment } from './schemas/access-environment.schema.js';

export class AccessConfig {
  private constructor(
    public readonly issuer: string,
    public readonly audience: string,
    public readonly jwksUrl: URL,
  ) {}

  public static fromEnvironment(environment: Environment): AccessConfig {
    const variables = environment.read(AccessEnvironment);
    return new AccessConfig(
      variables.JWT_ISSUER,
      variables.JWT_AUDIENCE,
      new URL(variables.AUTH_JWKS_URL),
    );
  }
}
