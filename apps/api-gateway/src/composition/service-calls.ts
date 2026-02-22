import type { CompiledSchema } from '@ftgo/common/infrastructure';
import type { StaticEncode, TProperties, TSchema } from 'typebox';

import type { ServiceName } from '../config/service-name.js';

export interface ServiceCalls {
  find<T extends TSchema>(
    service: ServiceName,
    path: string,
    authorization: string,
    schema: CompiledSchema<T>,
  ): Promise<StaticEncode<T, TProperties> | undefined>;
}
export const ServiceCalls = Symbol('ServiceCalls');
