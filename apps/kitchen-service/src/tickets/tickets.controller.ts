import { Role } from '@ftgo/common';
import { Caller, CurrentCaller, Requires, SchemaValidationPipe } from '@ftgo/common/infrastructure';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';

import { TicketResponse } from './dto/ticket-response.dto.js';
import { ConsumerId } from './entities/consumer-id.js';
import { TicketId } from './entities/ticket-id.js';
import { AcceptTicketRequest } from './schemas/accept-ticket-request.schema.js';
import { TicketIdParameter } from './schemas/ticket-id-parameter.schema.js';
import { TicketsService } from './tickets.service.js';

@Controller('tickets')
export class TicketsController {
  public constructor(private readonly ticketsService: TicketsService) {}

  @Get(':ticketId')
  public async get(
    @CurrentCaller() caller: Caller,
    @Param('ticketId', new SchemaValidationPipe(TicketIdParameter)) ticketId: string,
  ): Promise<TicketResponse> {
    return new TicketResponse(
      await this.ticketsService.getTicket(
        TicketId.of(ticketId),
        ConsumerId.of(caller.accountId.toString()),
        caller.role,
      ),
    );
  }

  @Post(':ticketId/accept')
  @Requires(Role.Admin)
  @HttpCode(HttpStatus.OK)
  public async accept(
    @Param('ticketId', new SchemaValidationPipe(TicketIdParameter)) ticketId: string,
    @Body(new SchemaValidationPipe(AcceptTicketRequest)) body: AcceptTicketRequest,
  ): Promise<TicketResponse> {
    return new TicketResponse(
      await this.ticketsService.acceptTicket(TicketId.of(ticketId), new Date(body.readyBy)),
    );
  }
}
