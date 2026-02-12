import { createPrivateKey, createPublicKey } from 'node:crypto';

import { InvalidInput } from '@ftgo/common';
import { calculateJwkThumbprint, exportJWK, importPKCS8, importSPKI, type JWK } from 'jose';

import { SIGNING_ALGORITHM } from '../auth.constants.js';

export class SigningKeys {
  private constructor(
    public readonly privateKey: CryptoKey,
    public readonly publicKey: CryptoKey,
    public readonly keyId: string,
    private readonly publicJwk: JWK,
  ) {}

  public static async load(encodedPrivateKey: string): Promise<SigningKeys> {
    const pem = Buffer.from(encodedPrivateKey, 'base64').toString('utf8');
    const publicPem = SigningKeys.publicPemOf(pem);
    const privateKey = await importPKCS8(pem, SIGNING_ALGORITHM);
    const publicKey = await importSPKI(publicPem, SIGNING_ALGORITHM, { extractable: true });
    const jwk = await exportJWK(publicKey);
    const keyId = await calculateJwkThumbprint(jwk);
    return new SigningKeys(privateKey, publicKey, keyId, {
      ...jwk,
      kid: keyId,
      alg: SIGNING_ALGORITHM,
      use: 'sig',
    });
  }

  private static publicPemOf(privatePem: string): string {
    try {
      const privateKey = createPrivateKey(privatePem);
      if (privateKey.asymmetricKeyType !== 'ed25519') {
        throw new InvalidInput(
          'configuration.invalid_signing_key',
          'JWT_SIGNING_KEY must be an Ed25519 key.',
        );
      }
      return createPublicKey(privateKey).export({ type: 'spki', format: 'pem' }).toString();
    } catch (error) {
      if (error instanceof InvalidInput) {
        throw error;
      }
      throw new InvalidInput(
        'configuration.invalid_signing_key',
        'JWT_SIGNING_KEY must be a base64-encoded PKCS#8 PEM. Generate one with `pnpm keys:generate`.',
        [],
        { cause: error },
      );
    }
  }

  public jwks(): { readonly keys: ReadonlyArray<JWK> } {
    return { keys: [this.publicJwk] };
  }
}
