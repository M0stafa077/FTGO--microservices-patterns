import { Caller, CurrentCaller, SchemaValidationPipe } from '@ftgo/common/infrastructure';
import { Controller, Get, Query } from '@nestjs/common';

import { OrderHistoryResponse } from './dto/order-history-response.dto.js';
import { ConsumerId } from './entities/consumer-id.js';
import { Keywords } from './entities/keywords.js';
import type { HistoryCriteria } from './history-criteria.js';
import { DEFAULT_PAGE_SIZE } from './order-history.constants.js';
import { OrderHistoryService } from './order-history.service.js';
import { PageToken } from './page-token.js';
import { OrderHistoryQuery } from './schemas/order-history-query.schema.js';

@Controller('orders')
export class OrderHistoryController {
  public constructor(private readonly orderHistoryService: OrderHistoryService) {}

  @Get()
  public async find(
    @CurrentCaller() caller: Caller,
    @Query(new SchemaValidationPipe(OrderHistoryQuery)) query: OrderHistoryQuery,
  ): Promise<OrderHistoryResponse> {
    return new OrderHistoryResponse(
      await this.orderHistoryService.findOrders(
        this.criteriaOf(query),
        ConsumerId.of(caller.accountId.toString()),
        caller.role,
      ),
    );
  }

  private criteriaOf(query: OrderHistoryQuery): HistoryCriteria {
    return {
      consumerId: ConsumerId.of(query.consumerId),
      state: query.state,
      keywords: query.keyword === undefined ? undefined : Keywords.of(query.keyword),
      since: query.since === undefined ? undefined : new Date(query.since),
      after: query.pageToken === undefined ? undefined : PageToken.parse(query.pageToken).position,
      pageSize: query.pageSize === undefined ? DEFAULT_PAGE_SIZE : Number(query.pageSize),
    };
  }
}
