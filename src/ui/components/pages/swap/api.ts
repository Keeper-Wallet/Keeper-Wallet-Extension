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

export interface SwopFiExchangerData {
  A_asset_balance: string;
  A_asset_id: string;
  A_asset_init: string;
  B_asset_balance: string;
  B_asset_id: string;
  B_asset_init: string;
  active: boolean;
  commission: number;
  commission_scale_delimiter: number;
  first_harvest_height: number;
  govFees24: string;
  govFees7d: string;
  id: string;
  lpFees24: string;
  lpFees7d: string;
  share_asset_id: string;
  share_asset_supply: string;
  share_limit_on_first_harvest: string;
  stakingIncome24: string;
  stakingIncome7d: string;
  totalLiquidity: string;
  txCount24: string;
  txCount7d: string;
  version: string;
  volume24: string;
  volume7d: string;
  volume_current_period: string;
}

export async function fetchExchangers(network: string) {
  const swopFiConfig = swopFiConfigsByNetwork[network];

  const json = await fetch(
    new URL('/exchangers/', swopFiConfig.backend).toString()
  ).then(
    res =>
      res.json() as Promise<{
        data: { [exchangerId: string]: SwopFiExchangerData };
        height: number;
        success: boolean;
      }>
  );

  if (!json.success) {
    throw new Error('Could not fetch exchangers from SwopFi backend');
  }

  return Object.fromEntries(
    Object.entries(json.data).filter(([_id, exchanger]) => exchanger.active)
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
