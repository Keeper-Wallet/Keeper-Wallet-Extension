import { type TransactionFromNode } from '@waves/ts-types';
import { type NftAssetDetail } from 'nfts/types';

import { MAX_NFT_ITEMS, MAX_TX_HISTORY_ITEMS } from '../../constants';

export interface WavesBalanceResponse {
  available: string;
  regular: string;
}

export interface WavesAssetsResponse {
  address: string;
  balances: Array<{
    assetId: string;
    balance: string;
    minSponsoredAssetFee: string | null;
    sponsorBalance: string;
  }>;
}

export class WavesApi {
  constructor(private getNode: () => string) {}

  async fetchBalance(address: string): Promise<WavesBalanceResponse> {
    const url = new URL(`addresses/balance/details/${address}`, this.getNode());

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch balance: ${response.status}`);
    }

    return response.json();
  }

  async fetchAssetsBalance(address: string): Promise<WavesAssetsResponse> {
    const url = new URL(`assets/balance/${address}`, this.getNode());

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch assets balance: ${response.status}`);
    }

    return response.json();
  }

  async fetchNfts(address: string): Promise<NftAssetDetail[]> {
    const url = new URL(
      `assets/nft/${address}/limit/${MAX_NFT_ITEMS}`,
      this.getNode(),
    );

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch NFTs: ${response.status}`);
    }

    return response.json();
  }

  async fetchAliases(address: string): Promise<string[]> {
    const url = new URL(`alias/by-address/${address}`, this.getNode());

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch aliases: ${response.status}`);
    }

    return response.json();
  }

  async fetchTxHistory(address: string): Promise<TransactionFromNode[]> {
    const url = new URL(
      `transactions/address/${address}/limit/${MAX_TX_HISTORY_ITEMS}`,
      this.getNode(),
    );

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction history: ${response.status}`);
    }

    const json = (await response.json()) as [TransactionFromNode[]];
    return json[0];
  }

  async fetchMultipleBalances(addresses: string[]): Promise<Array<{
    id: string;
    balance: string;
  }>> {
    const url = new URL('addresses/balance', this.getNode());
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json; large-significand-format=string',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addresses,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch multiple balances: ${response.status}`);
    }

    return response.json();
  }
} 
