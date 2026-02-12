import { Controller, Get, Header } from '@nestjs/common';
import type { JWK } from 'jose';

import { Public } from './decorators/public.decorator.js';
import { SigningKeys } from './tokens/signing-keys.js';

@Public()
@Controller('.well-known')
export class JwksController {
  public constructor(private readonly signingKeys: SigningKeys) {}

  @Get('jwks.json')
  @Header('Cache-Control', 'public, max-age=300')
  public keys(): { readonly keys: ReadonlyArray<JWK> } {
    return this.signingKeys.jwks();
  }
}
