import { SchemaValidationPipe } from '@ftgo/common/infrastructure';
import { Body, Controller, Get, Put } from '@nestjs/common';

import { CurrentPrincipal } from '../auth/decorators/current-principal.decorator.js';
import type { Principal } from '../auth/principal.js';

import { ConsumersService } from './consumers.service.js';
import { ProfileResponse } from './dto/profile-response.dto.js';
import { PersonName } from './entities/person-name.js';
import { PhoneNumber } from './entities/phone-number.js';
import { UpdateProfileRequest } from './schemas/update-profile-request.schema.js';

@Controller('consumers/me')
export class ConsumersController {
  public constructor(private readonly consumersService: ConsumersService) {}

  @Get()
  public async getProfile(@CurrentPrincipal() principal: Principal): Promise<ProfileResponse> {
    return new ProfileResponse(await this.consumersService.getById(principal.consumerId));
  }

  @Put()
  public async updateProfile(
    @CurrentPrincipal() principal: Principal,
    @Body(new SchemaValidationPipe(UpdateProfileRequest)) body: UpdateProfileRequest,
  ): Promise<ProfileResponse> {
    const consumer = await this.consumersService.updateProfile(principal.consumerId, {
      name: PersonName.of(body.firstName, body.lastName),
      phoneNumber: PhoneNumber.ofOptional(body.phoneNumber),
    });
    return new ProfileResponse(consumer);
  }
}
