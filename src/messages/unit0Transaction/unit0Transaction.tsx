import BigNumber from '@waves/bignumber';
import clsx from 'clsx';
import { TxDetailTabs } from 'messages/_common/detailTabs';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { type PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';
import { usePopupSelector } from 'popup/store/react';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { Ellipsis } from '../../ui/components/ui/ellipsis/Ellipsis';
import { type MessageOfType } from '../types';

export function Unit0TransactionCard({
  className,
  message,
}: {
  className?: string;
  collapsed?: boolean;
  message: MessageOfType<'unit0Transaction'>;
}) {
  const { t } = useTranslation();
  const assets = usePopupSelector(state => state.assets);

  // ERC-721 transfer: safeTransferFrom(address,address,uint256) - 0x42842e0e
  const isERC721 =
    message.data.data && message.data.data.startsWith('0x42842e0e');

  // ERC-1155 transfer: safeTransferFrom(address,address,uint256,uint256,bytes) - 0xf242432a
  const isERC1155 =
    message.data.data && message.data.data.startsWith('0xf242432a');

  // ERC-20 transfer: transfer(address,uint256) - 0xa9059cbb
  const isERC20 =
    message.data.data && message.data.data.startsWith('0xa9059cbb');

  let displayAmount = '';
  let displayAsset = 'Unit0';
  let tokenId = '';
  let tokenType = '';
  let recipientAddress = '';

  if (isERC721 && message.data.data) {
    // ERC-721 NFT transfer
    // data format: 0x42842e0e (4 bytes) + from (32 bytes) + to (32 bytes) + tokenId (32 bytes)
    try {
      const tokenIdHex = message.data.data.slice(138); // Skip function selector + from + to
      tokenId = BigInt('0x' + tokenIdHex).toString();

      displayAmount = `Token #${tokenId}`;
      displayAsset = assets[message.data.to]?.displayName ?? 'ERC-721 NFT';
      tokenType = 'ERC-721';

      // Extract recipient from data
      const recipientHex = message.data.data.slice(74, 138);
      recipientAddress = '0x' + recipientHex.slice(24); // Remove padding
    } catch (err) {
      console.warn('Failed to decode ERC-721 transfer:', err);
      displayAmount = 'NFT';
      displayAsset = 'ERC-721';
      tokenType = 'ERC-721';
    }
  } else if (isERC1155 && message.data.data) {
    // ERC-1155 NFT transfer
    // data format: 0xf242432a (4 bytes) + from (32 bytes) + to (32 bytes) + id (32 bytes) + amount (32 bytes) + data offset/length
    try {
      const tokenIdHex = message.data.data.slice(138, 202);
      const amountHex = message.data.data.slice(202, 266);

      tokenId = BigInt('0x' + tokenIdHex).toString();
      const amount = BigInt('0x' + amountHex).toString();

      displayAmount = `${amount}x Token #${tokenId}`;
      displayAsset = assets[message.data.to]?.displayName ?? 'ERC-1155 NFT';
      tokenType = 'ERC-1155';

      // Extract recipient from data
      const recipientHex = message.data.data.slice(74, 138);
      recipientAddress = '0x' + recipientHex.slice(24); // Remove padding
    } catch (err) {
      console.warn('Failed to decode ERC-1155 transfer:', err);
      displayAmount = 'NFT';
      displayAsset = 'ERC-1155';
      tokenType = 'ERC-1155';
    }
  } else if (isERC20 && message.data.data) {
    // ERC-20 token transfer: decode the data field
    // data format: 0xa9059cbb (4 bytes) + recipient (32 bytes) + amount (32 bytes)
    try {
      const tokenAmount = message.data.data.slice(74); // Skip function selector + recipient
      const amountInSmallestUnit = BigInt('0x' + tokenAmount);

      // Get token info from assets
      const tokenAsset = assets[message.data.to];
      const decimals = tokenAsset?.precision ?? 18;
      const tokenName = tokenAsset?.displayName ?? 'Token';

      // Convert to token units
      const amountInTokens = new BigNumber(amountInSmallestUnit.toString()).div(
        new BigNumber(10).pow(decimals),
      );

      displayAmount = amountInTokens.toFixed(8);
      displayAsset = tokenName;
      tokenType = 'ERC-20';

      // Extract recipient from data
      const recipientHex = message.data.data.slice(10, 74);
      recipientAddress = '0x' + recipientHex.slice(24); // Remove padding
    } catch (err) {
      console.warn('Failed to decode ERC-20 transfer:', err);
      // Fallback to showing 0 Unit0
      displayAmount = '0.00000000';
      displayAsset = 'Unit0';
    }
  } else {
    // Native Unit0 transfer
    const amountInTokens = new BigNumber(message.data.value.toString()).div(
      new BigNumber(10).pow(18),
    );
    displayAmount = amountInTokens.toFixed(8);
    displayAsset = 'Unit0';
    recipientAddress = message.data.to;
  }

  return (
    <div className={clsx(className, transactionsStyles.transactionCard)}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="transfer" />
        </div>

        <div>
          <div className="basic500 body3 margin-min">
            {isERC721 || isERC1155
              ? 'NFT Transfer'
              : t('transactions.transfer')}
            {tokenType && (
              <span
                style={{ marginLeft: '8px', fontSize: '0.9em', opacity: 0.7 }}
              >
                ({tokenType})
              </span>
            )}
          </div>

          <h1 className="headline1">
            <span>
              {displayAmount} {displayAsset}
            </span>
          </h1>
        </div>
      </div>

      <div className={transactionsStyles.cardContent}>
        {(isERC721 || isERC1155) && (
          <div className={transactionsStyles.txRow}>
            <div className="tx-title tag1 basic500">NFT Contract</div>

            <div className={transactionsStyles.txValue}>
              <Ellipsis text={message.data.to} />
            </div>
          </div>
        )}

        {tokenId && (
          <div className={transactionsStyles.txRow}>
            <div className="tx-title tag1 basic500">Token ID</div>

            <div className={transactionsStyles.txValue}>{tokenId}</div>
          </div>
        )}

        <div className={transactionsStyles.txRow}>
          <div className="tx-title tag1 basic500">
            {t('transactions.recipient')}
          </div>

          <div className={transactionsStyles.txValue}>
            <Ellipsis text={recipientAddress || message.data.to} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Unit0TransactionScreen({
  message,
  selectedAccount,
}: {
  message: MessageOfType<'unit0Transaction'>;
  selectedAccount: PreferencesAccount;
}) {
  const { t } = useTranslation();

  // Convert gasPrice from wei to gwei
  const gasPriceInGwei = new BigNumber(message.data.gasPrice)
    .div(new BigNumber(10).pow(9))
    .toFixed(2);

  // Calculate total fee: gasLimit * gasPrice (in wei) / 10^18 to get Unit0
  const totalFeeInUnit0 = new BigNumber(message.data.gasLimit)
    .mul(new BigNumber(message.data.gasPrice))
    .div(new BigNumber(10).pow(18))
    .toFixed(8);

  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <Unit0TransactionCard message={message} />
        </div>

        <TxDetailTabs
          json={JSON.stringify(
            {
              type: 'unit0Transaction',
              to: message.data.to,
              value: message.data.value,
              data: message.data.data,
              gasLimit: message.data.gasLimit,
              gasPrice: message.data.gasPrice,
              nonce: message.data.nonce,
              chainId: message.data.chainId,
            },
            null,
            2,
          )}
        >
          <div>
            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.fee')}
              </div>

              <div className={transactionsStyles.txValue}>
                {totalFeeInUnit0} Unit0
              </div>
            </div>

            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.gasPrice')}
              </div>
              <div className={transactionsStyles.txValue}>
                {gasPriceInGwei} Gwei
              </div>
            </div>

            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.gasLimit')}
              </div>
              <div className={transactionsStyles.txValue}>
                {message.data.gasLimit}
              </div>
            </div>

            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">Nonce</div>

              <div className={transactionsStyles.txValue}>
                {message.data.nonce}
              </div>
            </div>

            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">Chain ID</div>

              <div className={transactionsStyles.txValue}>
                {message.data.chainId === 88811
                  ? t('transactions.chainIdMainnet')
                  : t('transactions.chainIdTestnet')}
              </div>
            </div>
          </div>
        </TxDetailTabs>
      </div>

      <MessageFooter message={message} />
    </div>
  );
}
