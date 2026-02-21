import type { CourierId } from '../couriers/entities/courier-id.js';

export interface CourierAssignments {
  leastBusy(): Promise<CourierId | undefined>;
}
export const CourierAssignments = Symbol('CourierAssignments');
