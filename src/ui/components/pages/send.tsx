import { BigNumber } from '@waves/bignumber';
import { Money, Asset } from '@waves/data-entities';
import { validators } from '@waves/waves-transactions';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useIMask } from 'react-imask';
import { useAppSelector, useAppDispatch } from 'ui/store';
import { Input } from '../ui/input';
import { Button } from '../ui/buttons/Button';
import * as styles from './send.module.css';
import { Select } from '../ui/select/Select';
import { difference } from 'ramda';
import { getAsset, getBalances } from 'ui/actions';
import { Loader, Error } from '../ui';
import { signAndPublishTransaction } from 'ui/actions/transactions';

export function Send() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const assets = useAppSelector(state => state.assets);

  const accountBalance = useAppSelector(
    state => state.balances[state.selectedAccount.address]
  );

  const wavesBalance =
    accountBalance &&
    new Money(
      new BigNumber(accountBalance.available),
      new Asset(assets['WAVES'])
    );

  const assetBalances = accountBalance?.assets;

  const assetIdsToRequest = React.useMemo(() => {
    if (!assetBalances) {
      return [];
    }

    const assetBalanceIds = Object.keys(assetBalances);
    const assetInfoIds = Object.keys(assets);

    return difference(assetBalanceIds, assetInfoIds);
  }, [assetBalances, assets]);

  React.useEffect(() => {
    if (!assetBalances) {
      dispatch(getBalances());
    }
  }, [assetBalances, dispatch]);

  React.useEffect(() => {
    assetIdsToRequest.forEach(assetId => {
      dispatch(getAsset(assetId));
    });
  }, [assetIdsToRequest, dispatch]);

  const [recipientValue, setRecipientValue] = React.useState('');
  const [recipientTouched, setRecipientTouched] = React.useState(false);
  const recipientError = !recipientValue
    ? t('send.recipientRequiredError')
    : !(
        validators.isValidAddress(recipientValue) ||
        validators.isValidAliasName(recipientValue)
      )
    ? t('send.recipientInvalidError')
    : null;
  const showRecipientError = recipientError != null && recipientTouched;

  const [assetValue, setAssetValue] = React.useState('WAVES');

  const [amountValue, setAmountValue] = React.useState('');
  const [amountTouched, setAmountTouched] = React.useState(false);
  const amountError = !amountValue ? t('send.amountRequiredError') : null;
  const showAmountError = amountError != null && amountTouched;

  const [attachmentTouched, setAttachmentTouched] = React.useState(false);
  const [attachmentValue, setAttachmentValue] = React.useState('');
  const attachmentByteCount = new TextEncoder().encode(attachmentValue).length;
  const attachmentError =
    attachmentByteCount > 140 ? t('send.attachmentMaxLengthError') : null;
  const showAttachmentError = attachmentError != null && attachmentTouched;

  const amountMask = useIMask({
    mapToRadix: ['.', ','],
    mask: Number,
    radix: '.',
    scale: assets[assetValue].precision,
    thousandsSeparator: ' ',
  });

  React.useEffect(() => {
    const mask = amountMask.maskRef.current;

    if (!mask) {
      return;
    }

    function handleAccept() {
      setAmountValue(mask.unmaskedValue);
    }

    mask.on('accept', handleAccept);

    return () => {
      mask.off('accept', handleAccept);
    };
  }, []);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  return (
    <form
      className={styles.root}
      onSubmit={event => {
        event.preventDefault();

        setRecipientTouched(true);
        setAmountTouched(true);
        setAttachmentTouched(true);

        if (recipientError || amountError || attachmentError) {
          return;
        }

        setIsSubmitting(true);

        dispatch(
          signAndPublishTransaction({
            type: 4,
            data: {
              amount: { assetId: assetValue, tokens: amountValue },
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
            <Trans i18nKey="send.title" />
          </h1>
        </header>

        <div className={styles.fields}>
          <div className="input-title basic500 tag1">
            <Trans i18nKey="send.recipientInputLabel" />
          </div>

          <div className="margin-main-big">
            <Input
              autoComplete="off"
              autoFocus
              data-testid="recipientInput"
              error={showRecipientError}
              spellCheck={false}
              value={recipientValue}
              onBlur={() => {
                setRecipientTouched(true);
              }}
              onChange={event => {
                setRecipientValue(event.currentTarget.value);
              }}
            />

            <Error show={showRecipientError}>{recipientError}</Error>
          </div>

          <div className="input-title basic500 tag1">
            <Trans i18nKey="send.assetInputLabel" />
          </div>

          <div className="margin-main-big">
            {!wavesBalance ||
            !assetBalances ||
            assetIdsToRequest.length !== 0 ? (
              <Loader />
            ) : Object.keys(assetBalances).length === 0 ? (
              'WAVES'
            ) : (
              <Select
                className="fullwidth"
                selectList={[
                  {
                    id: 'WAVES',
                    text: `WAVES (${wavesBalance.toTokens()})`,
                    value: 'WAVES',
                  },
                ].concat(
                  Object.entries(assetBalances).map(
                    ([assetId, { balance }]) => {
                      const asset = assets[assetId];

                      const balanceMoney = new Money(
                        new BigNumber(balance),
                        new Asset(asset)
                      );

                      return {
                        id: asset.id,
                        text: `${asset.name} (${balanceMoney.toTokens()})`,
                        value: asset.id,
                      };
                    }
                  )
                )}
                selected={assetValue}
                onSelectItem={(id, value) => {
                  setAssetValue(value);
                }}
              />
            )}
          </div>

          <div className="input-title basic500 tag1">
            <Trans i18nKey="send.amountInputLabel" />
          </div>

          <div className="margin-main-big">
            <Input
              autoComplete="off"
              data-testid="amountInput"
              error={showAmountError}
              inputRef={amountMask.ref}
              onBlur={() => {
                setAmountTouched(true);
              }}
            />

            <Error show={showAmountError}>{amountError}</Error>
          </div>

          <div className="input-title basic500 tag1">
            <Trans
              i18nKey="send.attachmentInputLabel"
              count={attachmentByteCount}
              values={{
                max: 140,
              }}
            />
          </div>

          <div>
            <Input
              autoComplete="off"
              data-testid="attachmentInput"
              error={showAttachmentError}
              multiLine
              rows={4}
              value={attachmentValue}
              onBlur={() => {
                setAttachmentTouched(true);
              }}
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
          >
            <Trans i18nKey="send.submitButtonText" />
          </Button>
        </div>
      </div>
    </form>
  );
}
