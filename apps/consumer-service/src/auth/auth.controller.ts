import { SchemaValidationPipe } from '@ftgo/common/infrastructure';
import { Body, Controller, Header, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { ProfileResponse } from '../consumers/dto/profile-response.dto.js';
import { EmailAddress } from '../consumers/entities/email-address.js';
import { Password } from '../consumers/entities/password.js';
import { PersonName } from '../consumers/entities/person-name.js';
import { PhoneNumber } from '../consumers/entities/phone-number.js';

import { AuthService } from './auth.service.js';
import { CurrentPrincipal } from './decorators/current-principal.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { TokenResponse } from './dto/token-response.dto.js';
import type { Principal } from './principal.js';
import { RefreshRequest } from './schemas/refresh-request.schema.js';
import { RegisterRequest } from './schemas/register-request.schema.js';
import { SignInRequest } from './schemas/sign-in-request.schema.js';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(
    @Body(new SchemaValidationPipe(RegisterRequest)) body: RegisterRequest,
  ): Promise<ProfileResponse> {
    const consumer = await this.authService.register({
      email: EmailAddress.of(body.email),
      password: Password.of(body.password),
      name: PersonName.of(body.firstName, body.lastName),
      phoneNumber: PhoneNumber.ofOptional(body.phoneNumber),
    });
    return new ProfileResponse(consumer);
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  public async signIn(
    @Body(new SchemaValidationPipe(SignInRequest)) body: SignInRequest,
  ): Promise<TokenResponse> {
    const tokens = await this.authService.signIn(
      EmailAddress.of(body.email),
      Password.candidate(body.password),
    );
    return new TokenResponse(tokens);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  public async refresh(
    @Body(new SchemaValidationPipe(RefreshRequest)) body: RefreshRequest,
  ): Promise<TokenResponse> {
    return new TokenResponse(await this.authService.refresh(body.refreshToken));
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async signOut(@CurrentPrincipal() principal: Principal): Promise<void> {
    await this.authService.signOut(principal);
  }
}
