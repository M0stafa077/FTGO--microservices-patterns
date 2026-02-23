import type { HistoryPage } from '../history-page.js';
import { PageToken } from '../page-token.js';

import { HistoryEntryResponse } from './history-entry-response.dto.js';

export class OrderHistoryResponse {
  public readonly orders: ReadonlyArray<HistoryEntryResponse>;
  public readonly nextPageToken: string | null;

  public constructor(page: HistoryPage) {
    this.orders = page.entries.map((entry) => new HistoryEntryResponse(entry));
    this.nextPageToken = page.next === undefined ? null : PageToken.of(page.next).toString();
  }
}
