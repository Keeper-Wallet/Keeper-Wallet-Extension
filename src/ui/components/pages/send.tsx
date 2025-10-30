import { BigNumber } from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { type IAssetInfo } from '@waves/data-entities/dist/entities/Asset';
import { BLOCKCHAIN_TYPES } from 'assets/constants';
import { Unit0Api } from 'controllers/api/unit0Api';
import { NetworkName } from '../../../networks/types';
import { isAddressString, isAlias } from 'messages/utils';
import { createNft } from 'nfts/nfts';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { getBalances } from 'store/actions/balances';
import Background from 'ui/services/Background';

import { AssetAmountInput } from '../../../assets/amountInput';
import { ErrorMessage, Loader } from '../ui';
import { Button } from '../ui';
import { Input } from '../ui';
import { AddressSuggestInput } from '../ui/Address/SuggestInput';
import * as styles from './send.module.css';

export function Send() {
  const params = useParams<{ assetId: string }>();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const dispatch = usePopupDispatch();
  const selectedAccount = usePopupSelector(state => state.selectedAccount);
  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const chainId = usePopupSelector(
    state =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      state.selectedAccount?.networkCode!.charCodeAt(0),
  );
  const currentBlockchainType = usePopupSelector(
    state => state.currentBlockchainType || BLOCKCHAIN_TYPES.WAVES,
  );
  const isUnit0 = currentBlockchainType === BLOCKCHAIN_TYPES.UNIT0;
  const accountBalance = usePopupSelector(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    state => state.balances[state.selectedAccount?.address!],
  );
  const assetBalances = accountBalance?.assets;
  const assets = usePopupSelector(state => state.assets);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const asset = usePopupSelector(state => state.assets[params.assetId!]);

  // Detect NFTs: Unit0 NFTs have type field, Waves NFTs use precision/quantity/reissuable
  const isNft =
    asset &&
    (asset.type === 'ERC-721' ||
      asset.type === 'ERC-1155' ||
      (asset.precision === 0 &&
        new BigNumber(asset.quantity).eq(1) &&
        !asset.reissuable));

  const userAddress = usePopupSelector(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    state => state.selectedAccount?.address!,
  );

  const nftInfo = usePopupSelector(state => asset && state.nfts?.[asset.id]);
  const nftConfig = usePopupSelector(state => state.nftConfig);

  const displayName = useMemo(() => {
    if (!asset) {
      return null;
    }
    if (isNft) {
      const nft = createNft({
        asset,
        config: nftConfig,
        info: nftInfo,
        userAddress,
      });

      return nft.displayName;
    }

    return asset.displayName;
  }, [asset, userAddress, isNft, nftConfig, nftInfo]);

  useEffect(() => {
    if (!assetBalances) {
      dispatch(getBalances());
    }
  }, [assetBalances, dispatch]);

  const currentBalance = asset
    ? Money.fromCoins(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        !isNft ? assetBalances![asset.id]?.balance ?? 0 : 1,
        new Asset(asset as IAssetInfo),
      )
    : null;

  const [isTriedToSubmit, setIsTriedToSubmit] = useState(false);

  const [recipientValue, setRecipientValue] = useState('');

  // Validate recipient based on blockchain type
  const isValidRecipient = isUnit0
    ? /^0x[a-fA-F0-9]{40}$/.test(recipientValue) // Ethereum address format
    : isAddressString(recipientValue, chainId) || isAlias(recipientValue); // Waves address

  const recipientError = !recipientValue
    ? t('send.recipientRequiredError')
    : !isValidRecipient
    ? t('send.recipientInvalidError')
    : null;
  const showRecipientError = isTriedToSubmit && recipientError != null;

  const [amountValue, setAmountValue] = useState(isNft ? '1' : '');
  const [amountValueMasked, setAmountValueMasked] = useState('');
  const amountError = isNft
    ? null // Skip amount validation for NFTs
    : !currentBalance || !amountValue || Number(amountValue) === 0
    ? t('send.amountRequiredError')
    : !currentBalance.getTokens().gte(amountValue)
    ? t('send.insufficientFundsError')
    : null;
  const showAmountError = isTriedToSubmit && amountError != null && !isNft;

  const [attachmentValue, setAttachmentValue] = useState('');
  const attachmentByteCount = new TextEncoder().encode(attachmentValue).length;
  const attachmentError = isUnit0
    ? null // Unit0 doesn't support attachments
    : attachmentByteCount > 140
    ? t('send.attachmentMaxLengthError')
    : null;
  const showAttachmentError = isTriedToSubmit && attachmentError != null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  return (
    <form
      className={styles.root}
      onSubmit={event => {
        event.preventDefault();

        setIsTriedToSubmit(true);
        setSubmitError(null); // Clear previous submit errors

        if (recipientError || amountError || attachmentError) {
          return;
        }

        setIsSubmitting(true);

        if (isUnit0) {
          // Unit0 (Ethereum) transaction sending
          (async () => {
            try {
              if (!selectedAccount?.address) {
                throw new Error('No account selected');
              }

              const unit0Api = new Unit0Api();

              // Prepare transaction data based on asset type
              let txData: any;

              if (isNft) {
                const { ethers } = await import('ethers');

                // Determine NFT type and get token ID from asset
                const tokenType = asset.type || 'ERC-721';
                const tokenId = asset.tokenId || asset.id.split('_')[1] || '0';
                const contractAddress = asset.id.split('_')[0]; // Contract address is before underscore
                if (tokenType === 'ERC-721') {
                  // ERC-721: safeTransferFrom(address from, address to, uint256 tokenId)
                  const iface = new ethers.Interface([
                    'function safeTransferFrom(address from, address to, uint256 tokenId)',
                  ]);

                  const encodedData = iface.encodeFunctionData(
                    'safeTransferFrom',
                    [selectedAccount.address, recipientValue, tokenId],
                  );

                  txData = {
                    from: selectedAccount.address,
                    to: contractAddress,
                    value: '0x0',
                    data: encodedData,
                  };
                } else if (tokenType === 'ERC-1155') {
                  // ERC-1155: safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)
                  const iface = new ethers.Interface([
                    'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
                  ]);

                  const encodedData = iface.encodeFunctionData(
                    'safeTransferFrom',
                    [
                      selectedAccount.address,
                      recipientValue,
                      tokenId,
                      '1', // Amount (1 for single NFT)
                      '0x', // Empty bytes
                    ],
                  );

                  txData = {
                    from: selectedAccount.address,
                    to: contractAddress,
                    value: '0x0',
                    data: encodedData,
                  };
                } else {
                  throw new Error(`Unsupported NFT type: ${tokenType}`);
                }
              } else {
                // Check if this is an ERC-20 token or native UNIT0
                const isERC20Token = asset && asset.id !== 'unit0';
                const tokenDecimals = asset?.precision ?? 18;

                // Convert amount from tokens to smallest unit (wei for native, token units for ERC-20)
                const amountInSmallestUnit = new BigNumber(amountValue)
                  .mul(new BigNumber(10).pow(tokenDecimals))
                  .toFixed(0);

                if (isERC20Token) {
                  // ERC-20 token transfer
                  // Encode transfer(address to, uint256 amount) function call
                  const { ethers } = await import('ethers');

                  // Create interface for ERC-20 transfer function
                  const iface = new ethers.Interface([
                    'function transfer(address to, uint256 amount)',
                  ]);

                  // Encode the function call
                  const encodedData = iface.encodeFunctionData('transfer', [
                    recipientValue,
                    amountInSmallestUnit,
                  ]);

                  txData = {
                    from: selectedAccount.address,
                    to: asset.id, // Send to token contract, not recipient!
                    value: '0x0', // No native UNIT0 value for token transfers
                    data: encodedData,
                  };
                } else {
                  // Native UNIT0 transfer
                  const valueHex = `0x${BigInt(amountInSmallestUnit).toString(
                    16,
                  )}`;
                  txData = {
                    from: selectedAccount.address,
                    to: recipientValue,
                    value: valueHex,
                  };
                }
              }

              // Get nonce and gas price from blockchain
              const [nonce, gasPrice] = await Promise.all([
                unit0Api.getTransactionCount(
                  selectedAccount.address,
                  currentNetwork,
                ),
                unit0Api.getGasPrice(currentNetwork),
              ]);

              // Estimate gas limit for this transaction
              let gasLimit: string;
              try {
                const estimatedGas = await unit0Api.estimateGas(
                  { ...txData, gasPrice },
                  currentNetwork,
                );
                // Convert hex result to decimal string
                gasLimit = parseInt(estimatedGas, 16).toString();
              } catch (estimateError) {
                console.warn(
                  'Gas estimation failed, using default:',
                  estimateError,
                );
                // Fallback: 21000 for native, ~65000 for ERC-20, ~150000 for NFT
                gasLimit = isNft ? '150000' : txData.data ? '65000' : '21000';
              }

              // Validate sufficient UNIT0 balance for gas
              const gasCost = new BigNumber(gasPrice).mul(gasLimit);
              // For NFTs and tokens, only gas cost matters. For native transfers, add the transfer amount
              const totalCost =
                txData.data || isNft
                  ? gasCost
                  : gasCost.add(
                      txData.value === '0x0'
                        ? '0'
                        : txData.value.replace('0x', ''),
                    );

              // Get current UNIT0 balance (already in wei from assetBalances)
              const unit0Balance = assetBalances?.['unit0']?.balance ?? '0';
              const balanceInWei = new BigNumber(unit0Balance);

              // Check if balance is sufficient
              if (balanceInWei.lt(totalCost)) {
                const gasCostFormatted = gasCost
                  .div(new BigNumber(10).pow(18))
                  .toFixed(6);
                const balanceFormatted = balanceInWei
                  .div(new BigNumber(10).pow(18))
                  .toFixed(6);

                throw new Error(
                  `Insufficient UNIT0 for gas fees. You need ${gasCostFormatted} UNIT0 but have ${balanceFormatted} UNIT0`,
                );
              }

              // Determine chainId based on network
              // Unit0 chain IDs: Mainnet 88811, Testnet 88817
              const unit0ChainId =
                currentNetwork === NetworkName.Mainnet ? 88811 : 88817;

              await Background.signAndPublishUnit0Transaction({
                to: txData.to,
                value: txData.value,
                gasLimit,
                gasPrice,
                nonce,
                data: txData.data,
                chainId: unit0ChainId,
              });

              // Success - navigate back
              navigate(-1);
            } catch (err) {
              setIsSubmitting(false);
              if (err instanceof Error && /user denied/i.test(err.message)) {
                return;
              }
              // Display error to user
              setSubmitError(
                err instanceof Error
                  ? err.message
                  : 'Transaction failed. Please try again.',
              );
            }
          })();
          return;
        }

        Background.signAndPublishTransaction({
          type: 4,
          data: {
            amount: {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              assetId: asset!.id,
              tokens: amountValue,
            },
            recipient: recipientValue,
            attachment: attachmentValue,
          },
        }).catch(err => {
          if (err instanceof Error && /user denied/i.test(err.message)) {
            return;
          }

          throw err;
        });
      }}
    >
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            {!displayName ? <Loader /> : t('send.title', { name: displayName })}
          </h1>
        </header>

        <div className={styles.fields}>
          <div className="input-title basic500 tag1">
            {t('send.recipientInputLabel')}
          </div>

          <div className="margin-main-big">
            <AddressSuggestInput
              data-testid="recipientInput"
              error={showRecipientError}
              onChange={event => {
                setRecipientValue(event.currentTarget.value);
              }}
              onSuggest={value => {
                setRecipientValue(value);
              }}
            />

            <ErrorMessage show={showRecipientError}>
              {recipientError}
            </ErrorMessage>
          </div>

          {!isNft && (
            <div className="margin-main-big">
              {!asset ||
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              !assetBalances![asset.id] ? (
                <Loader />
              ) : (
                (() => {
                  const balance = new Money(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    new BigNumber(assetBalances![asset.id]?.balance ?? 0),
                    new Asset(asset as IAssetInfo),
                  );

                  return (
                    <>
                      <AssetAmountInput
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        assetBalances={assetBalances!}
                        assetOptions={Object.values(assets)
                          .filter(
                            // eslint-disable-next-line @typescript-eslint/no-shadow
                            (asset): asset is NonNullable<typeof asset> =>
                              asset != null,
                          )
                          .filter(
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-shadow
                            asset => assetBalances![asset.id] != null,
                          )}
                        balance={balance}
                        label={t('send.amountInputLabel')}
                        maskedValue={amountValueMasked}
                        value={amountValue}
                        showUsdAmount
                        onAssetChange={assetId => {
                          navigate(`/send/${assetId}`, { replace: true });
                        }}
                        onBalanceClick={async () => {
                          // For Unit0 native currency, subtract estimated gas
                          // For tokens and WAVES, use full balance
                          const isUnit0Native = isUnit0 && asset.id === 'unit0';

                          if (!isUnit0Native) {
                            // Tokens and WAVES: use full balance (original behavior)
                            setAmountValue(balance.toTokens());
                            setAmountValueMasked(balance.toTokens());
                            return;
                          }

                          // Unit0 native: subtract estimated gas
                          let maxSendable = balance.toTokens();

                          try {
                            const unit0Api = new Unit0Api();
                            const gasPrice =
                              await unit0Api.getGasPrice(currentNetwork);

                            // Standard transfer gas limit: 21000
                            const gasLimit = '21000';

                            // Calculate gas cost in wei, then convert to tokens
                            const gasCostWei = new BigNumber(gasPrice).mul(
                              gasLimit,
                            );
                            const gasCostTokens = gasCostWei
                              .div(new BigNumber(10).pow(18))
                              .toFixed();

                            // Subtract gas from balance
                            maxSendable = new BigNumber(balance.toTokens())
                              .sub(gasCostTokens)
                              .toFixed(asset.precision);

                            // Ensure non-negative
                            if (new BigNumber(maxSendable).lte(0)) {
                              maxSendable = '0';
                            }
                          } catch (err) {
                            console.warn(
                              'Failed to estimate gas, using balance minus default fee:',
                              err,
                            );
                            // Fallback: subtract ~0.001 UNIT0 for gas
                            maxSendable = new BigNumber(balance.toTokens())
                              .sub(0.001)
                              .toFixed(asset.precision);
                          }

                          setAmountValue(maxSendable);
                          setAmountValueMasked(maxSendable);
                        }}
                        onChange={(newValue, newMaskedValue) => {
                          setAmountValue(newValue);
                          setAmountValueMasked(newMaskedValue);
                        }}
                      />
                      <ErrorMessage show={showAmountError}>
                        {amountError}
                      </ErrorMessage>
                      <ErrorMessage
                        show={!!submitError}
                        data-testid="submitError"
                      >
                        {submitError}
                      </ErrorMessage>
                    </>
                  );
                })()
              )}
            </div>
          )}

          <div className="input-title basic500 tag1">
            {t('send.attachmentInputLabel', {
              count: attachmentByteCount,
              max: 140,
            })}
          </div>

          <div>
            <Input
              autoComplete="off"
              data-testid="attachmentInput"
              error={showAttachmentError}
              multiLine
              rows={4}
              value={attachmentValue}
              onChange={event => {
                setAttachmentValue(event.currentTarget.value);
              }}
            />

            <ErrorMessage show={showAttachmentError}>
              {attachmentError}
            </ErrorMessage>
          </div>
        </div>

        <div className={styles.submitButtonWrapper}>
          <Button
            className="fullwidth"
            data-testid="submitButton"
            disabled={isSubmitting}
            type="submit"
            view="submit"
          >
            {t('send.submitButtonText')}
          </Button>
        </div>
      </div>
    </form>
  );
}
