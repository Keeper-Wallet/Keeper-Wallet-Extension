import { type PreferencesAccount } from 'preferences/types';

export function compareAccountsByLastUsed(
  accA: PreferencesAccount,
  accB: PreferencesAccount,
) {
  const a = accA.lastUsed;
  const b = accB.lastUsed;

  if (a == null) {
    if (b == null) {
      return 0;
    }

    return 1;
  }

  if (b == null) {
    return -1;
  }

  return b - a;
}
