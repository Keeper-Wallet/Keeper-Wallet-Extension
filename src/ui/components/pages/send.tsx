import { BigNumber } from '@waves/bignumber';
import { Money, Asset } from '@waves/data-entities';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from 'ui/store';
import { Input } from '../ui/input';
import { Button } from '../ui/buttons/Button';
import * as styles from './send.module.css';
import { Select } from '../ui/select/Select';
import { difference } from 'ramda';
import { getAsset, getBalances } from 'ui/actions';
import { Loader, Error } from '../ui';

export function Send() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const assets = useAppSelector(state => state.assets);

  const wavesBalance = useAppSelector(
    state =>
      new Money(
        new BigNumber(state.balances[state.selectedAccount.address].available),
        new Asset(assets['WAVES'])
      )
  );

  const assetBalances = useAppSelector(
    state => state.balances[state.selectedAccount.address].assets
  );

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

  const isLoadingAssets = !assetBalances || assetIdsToRequest.length !== 0;

  const assetOptions = isLoadingAssets
    ? []
    : Object.entries(assetBalances).map(([assetId, { balance }]) => {
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
      });

  const [recipientValue, setRecipientValue] = React.useState('');
  const [recipientTouched, setRecipientTouched] = React.useState(false);
  const recipientError = !recipientValue
    ? t('send.recipientRequiredError')
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

        console.log(recipientValue, assetValue, amountValue, attachmentValue);
      }}
    >
      <div>
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
              error={showRecipientError}
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
            {isLoadingAssets ? (
              <Loader />
            ) : assetOptions.length === 0 ? (
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
                ].concat(assetOptions)}
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
              error={showAmountError}
              value={amountValue}
              onBlur={() => {
                setAmountTouched(true);
              }}
              onChange={event => {
                setAmountValue(event.currentTarget.value);
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

          <div className="margin-main-big">
            <Input
              autoComplete="off"
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
            disabled={isLoadingAssets}
            type="submit"
          >
            <Trans i18nKey="send.submitButtonText" />
          </Button>
        </div>
      </div>
    </form>
  );
}
