export interface SessionsTable {
  id: string;
  consumerId: string;
  refreshTokenHash: string;
  startedAt: Date;
  expiresAt: Date;
  lastRefreshedAt: Date;
  revokedAt: Date | null;
  revocationReason: string | null;
  version: number;
}
