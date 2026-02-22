import { ServiceUnavailable } from '@ftgo/common';

export class ServiceUnreachable extends ServiceUnavailable {
  public constructor(service: string, reason: string, options?: ErrorOptions) {
    super('gateway.service_unavailable', `The ${service} service ${reason}.`, options);
  }
}
