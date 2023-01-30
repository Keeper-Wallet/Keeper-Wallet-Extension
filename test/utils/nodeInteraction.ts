import { base58Decode } from '@keeper-wallet/waves-crypto';
import { create } from '@waves/node-api-js';
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
  const nodeApi = create(nodeUrl);
  const { generator } = await nodeApi.blocks.fetchHeadersLast();

  return getNetworkByteByAddress(generator);
}

function getNetworkByteByAddress(address: string): number {
  return base58Decode(address)[1];
}
