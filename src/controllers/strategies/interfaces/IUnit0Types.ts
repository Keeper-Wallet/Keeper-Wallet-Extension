/**
 * Unit0 Blockchain Type Definitions
 * Strategy-specific types for Unit0 balance, NFT, and transaction operations
 */

export interface Unit0BalanceResponse {
  coin_balance: string;
  exchange_rate?: string;
}

export interface Unit0TokenBalance {
  token_id: string;
  balance: string;
  token?: {
    address?: string;
    address_hash?: string;
    name?: string;
    symbol?: string;
    decimals?: number;
    type?: string;
  };
  value?: string;
}
export interface Unit0TokenAsset {
  address: string;
  metadata: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    icon_url: string | null;
    total_supply: string | null;
    holders_count: string;
    circulating_market_cap: string | null;
    type?: 'ERC-20' | 'ERC-721' | 'ERC-1155';
    exchange_rate: string | null;
    volume_24h: string | null;
  };
}

export interface Unit0NftAsset {
  address: string;
  id: string;
  metadata: {
    name: string;
    issuer: string;
    rank: number;
    symbol: string;
    decimals: number;
    type?: 'ERC-20' | 'ERC-721' | 'ERC-1155';
  };
}

export type Unit0Assets = Unit0TokenAsset | Unit0NftAsset;

export interface Unit0TokenInstance {
  animation_url: string | null;
  external_app_url: string | null;
  id: string;
  image_url: string | null;
  is_unique: boolean | null;
  media_type: string | null;
  media_url: string | null;
  metadata: string | null;
  owner: string | null;
  thumbnails: string[] | null;
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
  next_page_params: number | null;
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

export interface Unit0AddressInfo {
  ens_domain_name: string | null;
  hash: string;
  implementations: any[];
  is_contract: boolean;
  is_scam: boolean;
  is_verified: boolean;
  metadata: any;
  name: string | null;
  private_tags: any[];
  proxy_type: string | null;
  public_tags: any[];
  watchlist_names: any[];
}

export interface Unit0Transaction {
  hash: string;
  block_number: number;
  timestamp: string;
  from: Unit0AddressInfo;
  to: Unit0AddressInfo | null;
  value: string;
  fee: {
    type: string;
    value: string;
  };
  gas_used: string;
  gas_limit: string;
  gas_price: string;
  status: string;
  method: string | null;
  created_contract?: { hash: string } | null;
  decoded_input?: {
    method_call?: string;
    method_id?: string;
    parameters?: unknown[];
  } | null;
  result: string;
  type: number;
  nonce: number;
  position: number;
  confirmations: number;
  transaction_types: string[];
  token_transfers: Unit0TokenTransfer[] | null;
  base_fee_per_gas: string;
  exchange_rate: string | null;
}

export interface Unit0TransactionResponse {
  items: Unit0Transaction[];
  next_page_params: any;
}

export interface Unit0TokenTransfer {
  from: Unit0AddressInfo;
  to: Unit0AddressInfo;
  total: {
    value: string;
    token_id?: string;
  };
  token: {
    address: string;
    address_hash?: string;
    name: string;
    symbol: string;
    type: string;
    decimals: string;
  };
  type: string;
  log_index?: number;
  block_hash?: string;
  block_number?: number;
  timestamp: string;
  transaction_hash: string;
  method?: string;
}

export interface Unit0TokenTransferResponse {
  items: Unit0TokenTransfer[];
  next_page_params: any;
}
