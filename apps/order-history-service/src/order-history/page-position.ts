import type { OrderId } from './entities/order-id.js';

export class PagePosition {
  private constructor(
    public readonly createdAt: Date,
    public readonly orderId: OrderId,
  ) {}

  public static of(createdAt: Date, orderId: OrderId): PagePosition {
    return new PagePosition(createdAt, orderId);
  }
}
