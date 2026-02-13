export interface Transactions {
  run<T>(work: () => Promise<T>): Promise<T>;
}
export const Transactions = Symbol('Transactions');
