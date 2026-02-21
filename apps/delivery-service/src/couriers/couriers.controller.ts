import { Role } from '@ftgo/common';
import { Requires, SchemaValidationPipe } from '@ftgo/common/infrastructure';
import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';

import { CouriersService } from './couriers.service.js';
import { CourierResponse } from './dto/courier-response.dto.js';
import { CourierId } from './entities/courier-id.js';
import { CourierAvailabilityRequest } from './schemas/courier-availability-request.schema.js';
import { CourierIdParameter } from './schemas/courier-id-parameter.schema.js';

@Controller('couriers')
export class CouriersController {
  public constructor(private readonly couriersService: CouriersService) {}

  @Post(':courierId/availability')
  @Requires(Role.Admin)
  @HttpCode(HttpStatus.OK)
  public async updateAvailability(
    @Param('courierId', new SchemaValidationPipe(CourierIdParameter)) courierId: string,
    @Body(new SchemaValidationPipe(CourierAvailabilityRequest)) body: CourierAvailabilityRequest,
  ): Promise<CourierResponse> {
    return new CourierResponse(
      await this.couriersService.updateAvailability(CourierId.of(courierId), body.isAvailable),
    );
  }
}
