import { NetworkName } from '../../networks/types';
import { type TransactionFromNode, TRANSACTION_TYPE } from '@waves/ts-types';

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

export interface Unit0Transaction {
  hash: string;
  block_number: number;
  timestamp: string;
  from: {
    hash: string;
    name?: string | null;
    is_contract: boolean;
  };
  to: {
    hash: string;
    name?: string | null;
    is_contract: boolean;
  };
  value: string;
  gas_used: string;
  gas_limit: string;
  gas_price: string;
  fee: {
    type: string;
    value: string;
  };
  status: string;
  type: number;
  nonce: number;
  method?: string | null;
  transaction_types?: string[];
}

export class Unit0Api {
  private getBaseUrl(network: NetworkName): string {
    if (network === NetworkName.Testnet || network === NetworkName.Stagenet) {
      return 'https://explorer-testnet.unit0.dev/api/v2/addresses/';
    }
    return 'https://explorer.unit0.dev/api/v2/addresses/';
  }

  async fetchBalance(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0BalanceResponse> {
    const baseUrl = this.getBaseUrl(network);
    const mockAddress =
      network === NetworkName.Testnet
        ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
        : '0xA18Ea8fE573189e35bb4321adf04F0428d6C1612';
    const response = await fetch(`${baseUrl}${mockAddress}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch unit0 balance: ${response.status}`);
    }

    return response.json();
  }

  async fetchTokenBalances(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<Unit0TokenBalance[]> {
    const baseUrl = this.getBaseUrl(network);
    const mockAddress =
      network === NetworkName.Testnet
        ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
        : '0xA18Ea8fE573189e35bb4321adf04F0428d6C1612';
    const response = await fetch(`${baseUrl}${mockAddress}/token-balances`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch unit0 token balances: ${response.status}`,
      );
    }

    const tokens = await response.json();
    return Array.isArray(tokens) ? tokens : [];
  }

  async fetchBalanceAndTokens(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
  ): Promise<{
    balance: Unit0BalanceResponse;
    tokens: Unit0TokenBalance[];
  }> {
    const [balance, tokens] = await Promise.all([
      this.fetchBalance(address, network),
      this.fetchTokenBalances(address, network),
    ]);

    return { balance, tokens };
  }
  async fetchTransactionHistory(
    address: string,
    network: NetworkName = NetworkName.Mainnet,
    limit: number = 50,
  ): Promise<Unit0Transaction[]> {
    const baseUrl = this.getBaseUrl(network);
    const mockAddress =
      network === NetworkName.Testnet
        ? '0xE860EA6CF834Ca574A364e6B1Dc10A27102CaF84'
        : '0xA18Ea8fE573189e35bb4321adf04F0428d6C1612';

    const response = await fetch(
      `${baseUrl}${mockAddress}/transactions?limit=${limit}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch unit0 transaction history: ${response.status}`,
      );
    }

    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  // Convert Unit0 transaction to Waves-compatible format for history display
  convertToWavesTransaction(
    unit0Tx: Unit0Transaction,
    address: string,
  ): TransactionFromNode {
    const timestamp = new Date(unit0Tx.timestamp).getTime();

    const sender =
      unit0Tx.from?.hash || '0x0000000000000000000000000000000000000000';
    const recipient =
      unit0Tx.to?.hash || '0x0000000000000000000000000000000000000000';

    // Determine transaction direction for better UI handling
    const isSender = sender.toLowerCase() === address.toLowerCase();
    const isRecipient = recipient.toLowerCase() === address.toLowerCase();

    let direction: string;
    if (isRecipient && !isSender) {
      direction = 'incoming';
    } else if (isSender && !isRecipient) {
      direction = 'outgoing';
    } else if (isSender && isRecipient) {
      direction = 'self';
    } else {
      // Fallback case - shouldn't normally happen
      direction = 'outgoing';
    }

    return {
      id: unit0Tx.hash,
      type: TRANSACTION_TYPE.ETHEREUM,
      timestamp,
      height: unit0Tx.block_number,
      sender,
      fee: unit0Tx.fee?.value || '0',
      payload: {
        type: 'transfer',
        amount: unit0Tx.value || '0',
        asset: 'unit0', // Unit0 native token
        to: recipient,
        direction,
      },
    } as TransactionFromNode;
  }
}
