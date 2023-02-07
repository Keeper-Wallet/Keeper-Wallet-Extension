import { base58Decode } from '@keeper-wallet/waves-crypto';
import { broadcast, transfer } from '@waves/waves-transactions';

import { DEFAULT_MINER_SEED } from './constants';

export async function faucet({
  recipient,
  amount,
  nodeUrl,
}: {
  recipient: string;
  amount: number;
  nodeUrl: string;
}) {
  return await broadcast(
    transfer({ amount, recipient }, DEFAULT_MINER_SEED),
    nodeUrl
  );
}

export async function getNetworkByte(nodeUrl: string) {
  const response = await fetch(new URL('/blocks/headers/last', nodeUrl));
  const { generator } = await response.json();

  return getNetworkByteByAddress(generator);
}

export async function getTransactionStatus(
  transactionId: string,
  nodeUrl: string
) {
  const url = new URL('/transactions/status', nodeUrl);
  url.searchParams.set('id', transactionId);
  const response = await fetch(url);
  const json = await response.json();
  return json[0].status;
}

function getNetworkByteByAddress(address: string): number {
  return base58Decode(address)[1];
}
