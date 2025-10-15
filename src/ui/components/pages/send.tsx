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

  const isNft =
    asset &&
    asset.precision === 0 &&
    new BigNumber(asset.quantity).eq(1) &&
    !asset.reissuable;

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
  const amountError =
    !currentBalance || !amountValue || Number(amountValue) === 0
      ? t('send.amountRequiredError')
      : !currentBalance.getTokens().gte(amountValue)
      ? t('send.insufficientFundsError')
      : null;
  const showAmountError = isTriedToSubmit && amountError != null;

  const [attachmentValue, setAttachmentValue] = useState('');
  const attachmentByteCount = new TextEncoder().encode(attachmentValue).length;
  const attachmentError =
    attachmentByteCount > 140 ? t('send.attachmentMaxLengthError') : null;
  const showAttachmentError = isTriedToSubmit && attachmentError != null;

  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className={styles.root}
      onSubmit={event => {
        event.preventDefault();

        setIsTriedToSubmit(true);

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

              // Convert amount from tokens to wei (multiply by 10^18)
              const amountInWei = new BigNumber(amountValue)
                .mul(new BigNumber(10).pow(18))
                .toFixed(0);

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
                // Convert amount to hex for eth_estimateGas
                const valueHex = `0x${BigInt(amountInWei).toString(16)}`;

                const estimatedGas = await unit0Api.estimateGas(
                  {
                    from: selectedAccount.address,
                    to: recipientValue,
                    value: valueHex,
                    gasPrice,
                  },
                  currentNetwork,
                );
                // Convert hex result to decimal string
                gasLimit = parseInt(estimatedGas, 16).toString();
              } catch (estimateError) {
                console.warn(
                  'Gas estimation failed, using default:',
                  estimateError,
                );
                // Fallback to 21000 for simple transfers
                gasLimit = '21000';
              }

              // Determine chainId based on network
              // Unit0 chain IDs: Mainnet 88811, Testnet 88817
              const unit0ChainId =
                currentNetwork === NetworkName.Mainnet ? 88811 : 88817;

              await Background.signAndPublishUnit0Transaction({
                to: recipientValue,
                value: amountInWei,
                gasLimit,
                gasPrice,
                nonce,
                chainId: unit0ChainId,
              });

              // Success - navigate back
              navigate(-1);
            } catch (err) {
              setIsSubmitting(false);
              if (err instanceof Error && /user denied/i.test(err.message)) {
                return;
              }
              throw err;
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
                        onBalanceClick={() => {
                          setAmountValue(balance.toTokens());
                          setAmountValueMasked(balance.toTokens());
                        }}
                        onChange={(newValue, newMaskedValue) => {
                          setAmountValue(newValue);
                          setAmountValueMasked(newMaskedValue);
                        }}
                      />
                      <ErrorMessage show={showAmountError}>
                        {amountError}
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
