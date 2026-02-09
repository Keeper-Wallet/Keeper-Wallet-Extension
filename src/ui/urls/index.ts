const explorerUrls = new Map([
  ['W', 'wavesexplorer.com'],
  ['T', 'wavesexplorer.com'],
  ['S', 'wavesexplorer.com'],
  ['custom', 'wavesexplorer.com'],
]);

function buildExplorerUrl(networkCode: string, path: string): string {
  const code = explorerUrls.has(networkCode) ? networkCode : 'custom';
  const baseUrl = explorerUrls.get(code);
  const url = new URL(`https://${baseUrl}${path}`);

  if (code === 'T') {
    url.searchParams.set('network', 'testnet');
  } else if (code === 'S') {
    url.searchParams.set('network', 'stagenet');
  }
  // custom uses mainnet (no query params)

  return url.toString();
}

export function getAccountLink(
  networkCode: string,
  address: string | null | undefined,
) {
  // Check if this is a Unit0 address (starts with 0x)
  if (address?.startsWith('0x')) {
    // Use appropriate Unit0 explorer based on network code
    if (networkCode === '88817') {
      return `https://explorer-testnet.unit0.dev/address/${address}`;
    }
    return `https://explorer.unit0.dev/address/${address}`;
  }

  return buildExplorerUrl(networkCode, `/addresses/${address}`);
}

export function getCollectionLink(
  networkCode: string,
  address: string | null | undefined,
) {
  // Check if this is a Unit0 address (starts with 0x)
  if (address?.startsWith('0x')) {
    // Use appropriate Unit0 explorer based on network code
    if (networkCode === '88817') {
      return `https://explorer-testnet.unit0.dev/token/${address}`;
    }
    return `https://explorer.unit0.dev/token/${address}`;
  }

  return buildExplorerUrl(networkCode, `/addresses/${address}`);
}

export function getTxHistoryLink(networkCode: string, address: string): string {
  return `${getAccountLink(networkCode, address)}?tab=token_transfers`;
}

export function getNftsLink(networkCode: string, address: string): string {
  return `${getAccountLink(networkCode, address)}/nft/`;
}

export function getTxDetailLink(networkCode: string, txId: string): string {
  // Handle Unit0 network codes
  if (networkCode === '88817') {
    const cleanId = txId.includes('-') ? txId.split('-')[0] : txId;
    return `https://explorer-testnet.unit0.dev/tx/${cleanId}`;
  } else if (networkCode === '88811') {
    const cleanId = txId.includes('-') ? txId.split('-')[0] : txId;
    return `https://explorer.unit0.dev/tx/${cleanId}`;
  }

  return buildExplorerUrl(networkCode, `/tx/${txId}`);
}

export function getAssetDetailLink(
  networkCode: string,
  assetId: string,
  tokenId?: string,
): string {
  // Check if this is a Unit0 NFT (starts with 0x)
  if (assetId.startsWith('0x')) {
    // Use appropriate Unit0 explorer based on network code
    if (networkCode === '88817') {
      return `https://explorer-testnet.unit0.dev/token/${assetId}/instance/${tokenId}`;
    }
    return `https://explorer.unit0.dev/token/${assetId}/instance/${tokenId}`;
  }

  return buildExplorerUrl(networkCode, `/assets/${assetId}`);
}
