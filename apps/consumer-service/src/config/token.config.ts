import { Duration } from '@ftgo/common';
import { Environment } from '@ftgo/common/infrastructure';

import { TokenEnvironment } from './schemas/token-environment.schema.js';

export class TokenConfig {
  private constructor(
    public readonly issuer: string,
    public readonly audience: string,
    public readonly encodedSigningKey: string,
    public readonly accessTokenLifetime: Duration,
    public readonly sessionLifetime: Duration,
  ) {}

  public static fromEnvironment(environment: Environment): TokenConfig {
    const variables = environment.read(TokenEnvironment);
    return new TokenConfig(
      variables.JWT_ISSUER,
      variables.JWT_AUDIENCE,
      variables.JWT_SIGNING_KEY,
      Duration.ofSeconds(variables.ACCESS_TOKEN_TTL_SECONDS),
      Duration.ofDays(variables.SESSION_TTL_DAYS),
    );
  }
}
