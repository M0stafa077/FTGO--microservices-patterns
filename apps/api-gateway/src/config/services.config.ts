import { Duration } from '@ftgo/common';
import type { Environment } from '@ftgo/common/infrastructure';

import { ServicesEnvironment } from './schemas/services-environment.schema.js';
import { ServiceName } from './service-name.js';

export class ServicesConfig {
  private constructor(
    private readonly variables: ServicesEnvironment,
    public readonly forwardTimeout: Duration,
    public readonly compositionTimeout: Duration,
  ) {}

  public static fromEnvironment(environment: Environment): ServicesConfig {
    const variables = environment.read(ServicesEnvironment);
    return new ServicesConfig(
      variables,
      Duration.ofMilliseconds(variables.API_GATEWAY_FORWARD_TIMEOUT_MS),
      Duration.ofMilliseconds(variables.API_GATEWAY_COMPOSITION_TIMEOUT_MS),
    );
  }

  public urlOf(service: ServiceName, path: string): URL {
    return new URL(path, this.baseUrlOf(service));
  }

  private baseUrlOf(service: ServiceName): string {
    switch (service) {
      case ServiceName.Consumer:
        return this.variables.CONSUMER_SERVICE_URL;
      case ServiceName.Restaurant:
        return this.variables.RESTAURANT_SERVICE_URL;
      case ServiceName.Order:
        return this.variables.ORDER_SERVICE_URL;
      case ServiceName.Kitchen:
        return this.variables.KITCHEN_SERVICE_URL;
      case ServiceName.Delivery:
        return this.variables.DELIVERY_SERVICE_URL;
      case ServiceName.Accounting:
        return this.variables.ACCOUNTING_SERVICE_URL;
      default: {
        const unreachable: never = service;
        return unreachable;
      }
    }
  }
}
