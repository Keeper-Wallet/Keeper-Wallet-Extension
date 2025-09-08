const explorerUrls = new Map([
  ['W', 'wavesexplorer.com'],
  ['T', 'testnet.wavesexplorer.com'],
  ['S', 'stagenet.wavesexplorer.com'],
  ['custom', 'wavesexplorer.com/custom'],
]);

export function getAccountLink(
  networkCode: string,
  address: string | null | undefined,
) {
  // Check if this is a Unit0 address (starts with 0x)
  if (address?.startsWith('0x')) {
    // Use Unit0 explorer for Unit0 addresses
    return `https://explorer.unit0.dev/address/${address}`;
  }
  
  const explorer = explorerUrls.get(
    explorerUrls.has(networkCode) ? networkCode : 'custom',
  );
  return `https://${explorer}/address/${address}`;
}

export function getTxHistoryLink(networkCode: string, address: string): string {
  return `${getAccountLink(networkCode, address)}/tx/`;
}

export function getNftsLink(networkCode: string, address: string): string {
  return `${getAccountLink(networkCode, address)}/nft/`;
}

export function getTxDetailLink(networkCode: string, txId: string): string {
  // Handle Unit0 network codes
  if (networkCode === '88811' || networkCode === '88817') {
    return `https://explorer.unit0.dev/tx/${txId}`;
  }
  
  const explorer = explorerUrls.get(
    explorerUrls.has(networkCode) ? networkCode : 'custom',
  );
  return `https://${explorer}/tx/${txId}`;
}

export function getAssetDetailLink(
  networkCode: string,
  assetId: string,
): string {
  // Check if this is a Unit0 NFT (starts with 0x)
  if (assetId.startsWith('0x')) {
    // Use Unit0 explorer for Unit0 NFTs
    return `https://explorer.unit0.dev/token/${assetId}`;
  }
  
  const explorer = explorerUrls.get(
    explorerUrls.has(networkCode) ? networkCode : 'custom',
  );
  return `https://${explorer}/assets/${assetId}`;
}
