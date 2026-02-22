import { Caller, CurrentCaller, SchemaValidationPipe } from '@ftgo/common/infrastructure';
import { Controller, Get, Param } from '@nestjs/common';

import { AccountsService } from './accounts.service.js';
import { AuthorizationResponse } from './dto/authorization-response.dto.js';
import { AccountId } from './entities/account-id.js';
import { OrderId } from './entities/order-id.js';
import { AccountIdParameter } from './schemas/account-id-parameter.schema.js';
import { OrderIdParameter } from './schemas/order-id-parameter.schema.js';

@Controller('accounts')
export class AccountsController {
  public constructor(private readonly accountsService: AccountsService) {}

  @Get(':accountId/authorizations/:orderId')
  public async getAuthorization(
    @CurrentCaller() caller: Caller,
    @Param('accountId', new SchemaValidationPipe(AccountIdParameter)) accountId: string,
    @Param('orderId', new SchemaValidationPipe(OrderIdParameter)) orderId: string,
  ): Promise<AuthorizationResponse> {
    return new AuthorizationResponse(
      await this.accountsService.getAuthorization(
        AccountId.of(accountId),
        OrderId.of(orderId),
        AccountId.of(caller.accountId.toString()),
        caller.role,
      ),
    );
  }
}
