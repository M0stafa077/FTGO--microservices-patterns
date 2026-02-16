import { Address, Currency, InvalidInput, Money, Quantity } from '@ftgo/common';

import type { OrderLineItemsTable } from '../database/tables/order-line-items.table.js';
import type { OrdersTable } from '../database/tables/orders.table.js';
import { MenuItemId } from '../restaurants/entities/menu-item-id.js';
import { MenuItemName } from '../restaurants/entities/menu-item-name.js';
import { RestaurantId } from '../restaurants/entities/restaurant-id.js';
import { RestaurantName } from '../restaurants/entities/restaurant-name.js';

import { ConsumerId } from './entities/consumer-id.js';
import { DeliveryInformation } from './entities/delivery-information.js';
import { OrderId } from './entities/order-id.js';
import { OrderLineItem } from './entities/order-line-item.js';
import { OrderLineItems } from './entities/order-line-items.js';
import type { OrderState } from './entities/order-state.js';
import { Order } from './entities/order.entity.js';
import { ORDER_STATES } from './orders.constants.js';

export class OrderRecord {
  private constructor(
    private readonly row: OrdersTable,
    private readonly lineItems: ReadonlyArray<OrderLineItemsTable>,
  ) {}

  public static fromRows(
    row: OrdersTable,
    lineItems: ReadonlyArray<OrderLineItemsTable>,
  ): OrderRecord {
    return new OrderRecord(row, lineItems);
  }

  public static from(order: Order): OrderRecord {
    return new OrderRecord(OrderRecord.orderRowOf(order), OrderRecord.lineItemRowsOf(order));
  }

  private static orderRowOf(order: Order): OrdersTable {
    const { address, time } = order.deliveryInformation;
    return {
      id: order.id.toString(),
      consumerId: order.consumerId.toString(),
      restaurantId: order.restaurantId.toString(),
      restaurantName: order.restaurantName.toString(),
      state: order.state,
      deliveryStreet1: address.street1,
      deliveryStreet2: address.street2 ?? null,
      deliveryCity: address.city,
      deliveryState: address.state,
      deliveryZip: address.zip,
      deliveryTime: time,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      version: order.version,
    };
  }

  private static lineItemRowsOf(order: Order): OrderLineItemsTable[] {
    const orderId = order.id.toString();
    return order.lineItems.items.map((item, position) => ({
      orderId,
      menuItemId: item.menuItemId.toString(),
      position,
      name: item.name.toString(),
      priceAmount: item.price.amount,
      priceCurrency: item.price.currency.toString(),
      quantity: item.quantity.value,
    }));
  }

  public toOrder(): Order {
    return Order.restore({
      id: OrderId.of(this.row.id),
      consumerId: ConsumerId.of(this.row.consumerId),
      restaurantId: RestaurantId.of(this.row.restaurantId),
      restaurantName: RestaurantName.of(this.row.restaurantName),
      lineItems: OrderLineItems.of(this.lineItems.map((item) => this.toLineItem(item))),
      deliveryInformation: this.toDeliveryInformation(),
      state: this.state(),
      createdAt: this.row.createdAt,
      updatedAt: this.row.updatedAt,
      version: this.row.version,
    });
  }

  public orderRow(): OrdersTable {
    return { ...this.row };
  }

  public lineItemRows(): OrderLineItemsTable[] {
    return this.lineItems.map((item) => ({ ...item }));
  }

  private toLineItem(item: OrderLineItemsTable): OrderLineItem {
    return OrderLineItem.of(
      MenuItemId.of(item.menuItemId),
      MenuItemName.of(item.name),
      Money.of(item.priceAmount, Currency.of(item.priceCurrency)),
      Quantity.of(item.quantity),
    );
  }

  private toDeliveryInformation(): DeliveryInformation {
    return DeliveryInformation.of(
      Address.of({
        street1: this.row.deliveryStreet1,
        street2: this.row.deliveryStreet2 ?? undefined,
        city: this.row.deliveryCity,
        state: this.row.deliveryState,
        zip: this.row.deliveryZip,
      }),
      this.row.deliveryTime,
    );
  }

  private state(): OrderState {
    const state = ORDER_STATES.get(this.row.state);
    if (state === undefined) {
      throw new InvalidInput('order.unknown_state', `Unknown order state "${this.row.state}".`);
    }
    return state;
  }
}
