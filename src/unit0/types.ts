export interface Unit0BalanceResponse {
  coin_balance: string;
  exchange_rate?: string;
}

export interface Unit0TokenBalance {
  token_id: string;
  balance: string;
  token?: {
    address: string;
    name?: string;
    symbol?: string;
    decimals?: number;
  };
  value?: string;
}

export interface Unit0TokenInstance {
  animation_url: string | null;
  external_app_url: string | null;
  id: string;
  image_url: string | null;
  is_unique: boolean | null;
  media_type: string | null;
  media_url: string | null;
  metadata: any | null;
  owner: any | null;
  thumbnails: any | null;
  token: {
    address: string;
    address_hash: string;
    circulating_market_cap: string | null;
    decimals: number | null;
    exchange_rate: string | null;
    holders: string;
    holders_count: string;
    icon_url: string | null;
    name: string;
    symbol: string;
    total_supply: string | null;
    type: string;
    volume_24h: string | null;
  };
}

export interface Unit0NftTransfer {
  block_hash: string;
  block_number: number;
  from: {
    hash: string;
    name?: string;
  };
  to: {
    hash: string;
    name?: string;
  };
  log_index: number;
  method: string;
  timestamp: string;
  token: {
    address: string;
    hash: string;
    address_hash: string;
    name: string;
    symbol: string;
    type: string;
    decimals: string;
  };
  total: {
    token_id: string;
    token_instance: Unit0TokenInstance;
    value: string;
  };
  transaction_hash: string;
  type: string;
}

export interface Unit0NftResponse {
  items: Unit0NftTransfer[];
  next_page_params: any | null;
}

export interface Unit0TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  total_supply: string | null;
  volume_24h: string | null;
  icon_url: string | null;
  holders_count: string;
  circulating_market_cap: string | null;
  exchange_rate: string | null;
}

export interface Unit0TokenDetailsResponse {
  address?: string;
  hash?: string;
  address_hash: string;
  circulating_market_cap: string | null;
  creator_address_hash?: string;
  decimals: number | null;
  exchange_rate: string | null;
  holders: string;
  holders_count: string;
  icon_url: string | null;
  name: string;
  symbol: string;
  total_supply: string | null;
  type: string;
  volume_24h: string | null;
}
