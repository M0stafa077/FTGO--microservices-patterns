import type { OrderEventTranslation } from './order-event-translation.js';

export interface OrderEvent {
  translate<T>(translation: OrderEventTranslation<T>): T;
}
