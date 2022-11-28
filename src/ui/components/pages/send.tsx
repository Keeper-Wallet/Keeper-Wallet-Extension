import { BigNumber } from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { validators } from '@waves/waves-transactions';
import { createNft } from 'nfts/nfts';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { getBalances } from 'ui/actions/balances';
import Background from 'ui/services/Background';
import { useAppDispatch, useAppSelector } from 'ui/store';

import { AssetAmountInput } from '../../../assets/amountInput';
import { ErrorMessage, Loader } from '../ui';
import { AddressSuggestInput } from '../ui/Address/SuggestInput';
import { Button } from '../ui/buttons/Button';
import { Input } from '../ui/input';
import * as styles from './send.module.css';

export function Send() {
  const params = useParams<{ assetId: string }>();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const chainId = useAppSelector(state =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state.selectedAccount?.networkCode!.charCodeAt(0)
  );
  const accountBalance = useAppSelector(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    state => state.balances[state.selectedAccount?.address!]
  );
  const assetBalances = accountBalance?.assets;
  const assets = useAppSelector(state => state.assets);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const asset = useAppSelector(state => state.assets[params.assetId!]);

  const isNft =
    asset && asset.precision === 0 && asset.quantity === 1 && !asset.reissuable;

  const userAddress = useAppSelector(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    state => state.selectedAccount?.address!
  );

  const nftInfo = useAppSelector(state => asset && state.nfts?.[asset.id]);
  const nftConfig = useAppSelector(state => state.nftConfig);

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
        !isNft ? assetBalances![asset.id]?.balance : 1,
        new Asset(asset)
      )
    : null;

  const [isTriedToSubmit, setIsTriedToSubmit] = useState(false);

  const [recipientValue, setRecipientValue] = useState('');
  const recipientError = !recipientValue
    ? t('send.recipientRequiredError')
    : !(
        validators.isValidAddress(recipientValue, chainId) ||
        validators.isValidAlias(recipientValue)
      )
    ? t('send.recipientInvalidError')
    : null;
  const showRecipientError = isTriedToSubmit && recipientError != null;

  const [amountValue, setAmountValue] = useState(isNft ? '1' : '');
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                setRecipientValue(value!);
              }}
            />

            <ErrorMessage show={showRecipientError}>
              {recipientError}
            </ErrorMessage>
          </div>

          {!isNft && (
            <>
              <div className="margin-main-big">
                {!asset ||
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                !assetBalances![asset.id] ? (
                  <Loader />
                ) : (
                  (() => {
                    const balance = new Money(
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      new BigNumber(assetBalances![asset.id].balance),
                      new Asset(asset)
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
                                asset != null
                            )
                            .filter(
                              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-shadow
                              asset => assetBalances![asset.id] != null
                            )}
                          balance={balance}
                          label={t('send.amountInputLabel')}
                          showUsdAmount
                          value={amountValue}
                          onAssetChange={assetId => {
                            navigate(`/send/${assetId}`, { replace: true });
                          }}
                          onBalanceClick={() => {
                            setAmountValue(balance.toTokens());
                          }}
                          onChange={value => {
                            setAmountValue(value);
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
            </>
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
