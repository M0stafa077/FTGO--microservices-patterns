import type { OrderHistoryEntry } from './entities/order-history-entry.entity.js';
import type { PagePosition } from './page-position.js';

export class HistoryPage {
  public constructor(
    public readonly entries: ReadonlyArray<OrderHistoryEntry>,
    public readonly next: PagePosition | undefined,
  ) {}
}
