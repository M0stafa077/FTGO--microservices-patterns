import { Currency, Money, Quantity } from '@ftgo/common';
import type { Money as MoneyPayload } from '@ftgo/contracts';

import { HistoryLineItem } from './entities/history-line-item.js';
import type { HistoryLineItemDocument } from './schemas/history-line-item-document.schema.js';

export class LineItemPayloads {
  public toLineItems(payloads: ReadonlyArray<HistoryLineItemDocument>): HistoryLineItem[] {
    return payloads.map((payload) =>
      HistoryLineItem.of(
        payload.menuItemId,
        payload.name,
        this.toMoney(payload.price),
        Quantity.of(payload.quantity),
      ),
    );
  }

  public toMoney(payload: MoneyPayload): Money {
    return Money.of(payload.amount, Currency.of(payload.currency));
  }

  public fromLineItems(items: ReadonlyArray<HistoryLineItem>): HistoryLineItemDocument[] {
    return items.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      price: this.fromMoney(item.price),
      quantity: item.quantity.value,
    }));
  }

  public fromMoney(money: Money): MoneyPayload {
    return { amount: money.amount, currency: money.currency.toString() };
  }
}
