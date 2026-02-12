export interface ConsumersTable {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  registeredAt: Date;
  updatedAt: Date;
  version: number;
}
