import {
  base58Decode,
  base58Encode,
  createPrivateKey,
  createPublicKey,
  signBytes,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { TRANSACTION_TYPE } from '@waves/ts-types';

import { makeTxBytes, stringifyTransaction } from '../../src/messages/utils';
import { DEFAULT_MINER_SEED } from './constants';

export async function faucet({
  recipient,
  amount,
  nodeUrl,
  chainId,
}: {
  recipient: string;
  amount: number;
  nodeUrl: string;
  chainId: number;
}) {
  const minerPrivateKeyBytes = await createPrivateKey(
    utf8Encode(DEFAULT_MINER_SEED),
  );
  const minerPublicKeyBytes = await createPublicKey(minerPrivateKeyBytes);
  const minerPublicKey = base58Encode(minerPublicKeyBytes);

  const data = {
    type: TRANSACTION_TYPE.TRANSFER,
    senderPublicKey: minerPublicKey,
    recipient,
    amount,
    chainId,
    version: 2 as const,
    assetId: null,
    feeAssetId: null,
    fee: 100000,
    timestamp: Date.now(),
  };
  const txBytes = makeTxBytes(data);
  const signature = await signBytes(minerPrivateKeyBytes, txBytes);
  const signedTx = {
    ...data,
    id: '',
    initialFee: 0,
    initialFeeAssetId: null,
    proofs: [base58Encode(signature)],
  };
  await fetch(new URL('transactions/broadcast', nodeUrl), {
    method: 'POST',
    headers: {
      accept: 'application/json; large-significand-format=string',
      'content-type': 'application/json; charset=utf-8',
    },
    body: stringifyTransaction(signedTx),
  });
}

export async function getNetworkByte(nodeUrl: string) {
  const response = await fetch(new URL('/blocks/headers/last', nodeUrl));
  const { generator } = await response.json();

  return getNetworkByteByAddress(generator);
}

export async function getTransactionStatus(
  transactionId: string,
  nodeUrl: string,
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
