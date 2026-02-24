import type { Environment } from '../infrastructure/config/environment.js';

import { TracingEnvironment } from './schemas/tracing-environment.schema.js';

export class TracingConfig {
  private constructor(
    public readonly endpoint: URL,
    public readonly sampleRatio: number,
  ) {}

  public static fromEnvironment(environment: Environment): TracingConfig {
    const variables = environment.read(TracingEnvironment);
    return new TracingConfig(new URL(variables.TRACING_ENDPOINT), variables.TRACING_SAMPLE_RATIO);
  }
}
