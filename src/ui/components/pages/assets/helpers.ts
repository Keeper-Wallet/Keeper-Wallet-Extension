const explorerUrls = new Map([
  ['W', 'wavesexplorer.com'],
  ['T', 'testnet.wavesexplorer.com'],
  ['S', 'stagenet.wavesexplorer.com'],
  ['custom', 'wavesexplorer.com/custom'],
]);

export function getTxHistoryLink(networkCode: string, address: string): string {
  const explorer = explorerUrls.get(
    explorerUrls.has(networkCode) ? networkCode : 'custom'
  );
  return `https://${explorer}/address/${address}/tx/`;
}

export function getTxDetailLink(networkCode: string, txId: string): string {
  const explorer = explorerUrls.get(
    explorerUrls.has(networkCode) ? networkCode : 'custom'
  );
  return `https://${explorer}/tx/${txId}`;
}

export const colors = {
  white: '#FFFFFF',
  basic200: '#DAE1E9',
  basic500: '#9BA6B2',
  submit200: '#BACAF4',
  submit400: '#1F5AF6',
  out: '#FFAF00',
  in: '#81C926',
};

export const icontains = (source, target) =>
  (source ?? '').toLowerCase().includes((target ?? '').toLowerCase());
