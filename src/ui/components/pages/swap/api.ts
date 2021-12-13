import { Asset } from '@waves/data-entities';

interface SwopFiConfig {
  backend: string;
}

const swopFiConfigsByNetwork: Partial<Record<string, SwopFiConfig>> = {
  mainnet: {
    backend: 'https://backend.swop.fi',
  },
  testnet: {
    backend: 'https://backend-dev.swop.fi',
  },
};

interface SwopFiAssetData {
  description: string;
  hasScript: boolean;
  height: number;
  id: string;
  minSponsoredFee: number;
  name: string;
  precision: number;
  quantity: string;
  reissuable: boolean;
  sender: string;
  ticker: string | null;
  timestamp: string;
}

export async function fetchAssets(network: string) {
  const swopFiConfig = swopFiConfigsByNetwork[network];

  const json = await fetch(
    new URL('/assets/', swopFiConfig.backend).toString()
  ).then(
    res =>
      res.json() as Promise<{
        data: { [assetId: string]: SwopFiAssetData };
        height: number;
        success: boolean;
      }>
  );

  if (!json.success) {
    throw new Error('Could not fetch assets from SwopFi backend');
  }

  return Object.fromEntries(
    Object.entries(json.data).map(([id, asset]) => [
      id,
      new Asset({
        ...asset,
        timestamp: new Date(Number(asset.timestamp)),
      }),
    ])
  );
}

export async function fetchGetMoney({
  fromAmount,
  fromBalance,
  toBalance,
}: {
  fromAmount: string;
  fromBalance: string;
  toBalance: string;
}) {
  const json = await fetch(
    `https://flat.swop.fi/get-money/${fromBalance}/${toBalance}/${fromAmount}`
  ).then(
    res =>
      res.json() as Promise<{
        data: { money: string };
        params: { payMoney: string };
      }>
  );

  return json.data.money;
}
