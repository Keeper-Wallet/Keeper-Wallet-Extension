import { BigNumber } from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { validators } from '@waves/waves-transactions';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { Input } from '../ui/input';
import { Button } from '../ui/buttons/Button';
import * as styles from './send.module.css';
import { getBalances, setUiState } from 'ui/actions';
import { Error, Loader } from '../ui';
import { signAndPublishTransaction } from 'ui/actions/transactions';
import { AssetAmountInput } from '../../../assets/amountInput';

export function Send() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const chainId = useAppSelector(state =>
    state.selectedAccount.networkCode.charCodeAt(0)
  );
  const accountBalance = useAppSelector(
    state => state.balances[state.selectedAccount.address]
  );
  const assetBalances = accountBalance?.assets;
  const assets = useAppSelector(state => state.assets);
  const currentAsset = useAppSelector(state => state.uiState?.currentAsset);
  const isNft =
    currentAsset &&
    currentAsset.precision === 0 &&
    currentAsset.quantity == 1 &&
    !currentAsset.reissuable;

  React.useEffect(() => {
    if (!assetBalances) {
      dispatch(getBalances());
    }
  }, [assetBalances, dispatch]);

  const currentBalance = currentAsset
    ? Money.fromCoins(
        !isNft ? assetBalances[currentAsset.id]?.balance : 1,
        new Asset(currentAsset)
      )
    : null;

  const [isTriedToSubmit, setIsTriedToSubmit] = React.useState(false);

  const [recipientValue, setRecipientValue] = React.useState('');
  const recipientError = !recipientValue
    ? t('send.recipientRequiredError')
    : !(
        validators.isValidAddress(recipientValue, chainId) ||
        validators.isValidAliasName(recipientValue)
      )
    ? t('send.recipientInvalidError')
    : null;
  const showRecipientError = isTriedToSubmit && recipientError != null;

  const [amountValue, setAmountValue] = React.useState(isNft ? '1' : '');
  const amountError =
    !currentBalance || !amountValue || Number(amountValue) == 0
      ? t('send.amountRequiredError')
      : !currentBalance.getTokens().gte(amountValue)
      ? t('send.insufficientFundsError')
      : null;
  const showAmountError = isTriedToSubmit && amountError != null;

  const [attachmentValue, setAttachmentValue] = React.useState('');
  const attachmentByteCount = new TextEncoder().encode(attachmentValue).length;
  const attachmentError =
    attachmentByteCount > 140 ? t('send.attachmentMaxLengthError') : null;
  const showAttachmentError = isTriedToSubmit && attachmentError != null;

  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

        dispatch(
          signAndPublishTransaction({
            type: 4,
            data: {
              amount: {
                assetId: currentAsset.id,
                tokens: amountValue,
              },
              recipient: recipientValue,
              attachment: attachmentValue,
            },
          })
        );
      }}
    >
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            {!currentAsset ? (
              <Loader />
            ) : (
              t('send.title', { name: currentAsset.displayName })
            )}
          </h1>
        </header>

        <div className={styles.fields}>
          <div className="input-title basic500 tag1">
            {t('send.recipientInputLabel')}
          </div>

          <div className="margin-main-big">
            <Input
              autoComplete="off"
              autoFocus
              data-testid="recipientInput"
              error={showRecipientError}
              spellCheck={false}
              value={recipientValue}
              onChange={event => {
                setRecipientValue(event.currentTarget.value);
              }}
            />

            <Error show={showRecipientError}>{recipientError}</Error>
          </div>

          {!isNft && (
            <>
              <div className="margin-main-big">
                {!currentAsset || !assetBalances[currentAsset.id] ? (
                  <Loader />
                ) : (
                  (() => {
                    const balance = new Money(
                      new BigNumber(assetBalances[currentAsset.id].balance),
                      new Asset(currentAsset)
                    );

                    return (
                      <>
                        <AssetAmountInput
                          assetBalances={assetBalances}
                          assetOptions={Object.values(assets).filter(
                            asset => assetBalances[asset.id] != null
                          )}
                          balance={balance}
                          label={t('send.amountInputLabel')}
                          showUsdAmount
                          value={amountValue}
                          onAssetChange={assetId => {
                            dispatch(
                              setUiState({ currentAsset: assets[assetId] })
                            );
                          }}
                          onBalanceClick={() => {
                            setAmountValue(balance.toTokens());
                          }}
                          onChange={value => {
                            setAmountValue(value);
                          }}
                        />
                        <Error show={showAmountError}>{amountError}</Error>
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

            <Error show={showAttachmentError}>{attachmentError}</Error>
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
