import { WORD_SEPARATOR } from '../order-history.constants.js';

import type { HistoryLineItem } from './history-line-item.js';

export class Keywords {
  private constructor(private readonly words: ReadonlySet<string>) {}

  public static of(text: string): Keywords {
    const words = text
      .toLowerCase()
      .split(WORD_SEPARATOR)
      .filter((word) => word.length > 0);
    return new Keywords(new Set(words));
  }

  public static ofOrder(
    restaurantName: string,
    lineItems: ReadonlyArray<HistoryLineItem>,
  ): Keywords {
    return Keywords.of([restaurantName, ...lineItems.map((item) => item.name)].join(' '));
  }

  public toArray(): ReadonlyArray<string> {
    return [...this.words].sort();
  }
}
