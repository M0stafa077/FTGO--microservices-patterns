export interface Transactions {
  run<T>(work: () => Promise<T>): Promise<T>;

  isActive(): boolean;
}
export const Transactions = Symbol('Transactions');
