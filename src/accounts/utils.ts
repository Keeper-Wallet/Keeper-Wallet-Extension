import { Account } from './types';

export function compareAccountsByLastUsed(accA: Account, accB: Account) {
  const a = accA.lastUsed;
  const b = accB.lastUsed;

  if (a == null && b == null) {
    return 0;
  }

  if (a == null && b != null) {
    return 1;
  }

  if (a != null && b == null) {
    return -1;
  }

  return b - a;
}
