// Prints a new Ed25519 signing key for access tokens, as a line for `.env`.
// Usage: pnpm keys:generate >> .env
import { generateKeyPairSync } from 'node:crypto';

const { privateKey } = generateKeyPairSync('ed25519');
const pem = privateKey.export({ type: 'pkcs8', format: 'pem' });
process.stdout.write(`JWT_SIGNING_KEY=${Buffer.from(pem).toString('base64')}\n`);
