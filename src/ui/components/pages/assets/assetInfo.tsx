import { Asset, Money } from '@waves/data-entities';
import { type AssetDetail } from 'assets/types';
import { useTranslation } from 'react-i18next';

import { usePopupSelector } from '../../../../popup/store/react';
import { getAssetDetailLink } from '../../../urls';
import { Balance, Button, Copy, DateFormat, Ellipsis } from '../../ui';

interface Props {
  asset: AssetDetail;
  onCopy: () => void;
  onClose: () => void;
}

export function AssetInfo({ asset, onCopy, onClose }: Props) {
  const { t } = useTranslation();
  const networkCode = usePopupSelector(
    state => state.selectedAccount?.networkCode,
  );

  return (
    <div className="modal cover">
      <div className="modal-form">
        <div className="margin-main">
          <div className="input-title basic500 tag1">{t('assetInfo.id')}</div>
          <div className="flex tag1">
            <Ellipsis text={asset.id} size={14} />
            <Copy text={asset.id}>
              <div className="copy-icon" onClick={onCopy} />
            </Copy>
          </div>
        </div>

        <div className="margin-main">
          <div className="input-title basic500 tag1">{t('assetInfo.name')}</div>
          <div className="tag1">{asset.name}</div>
        </div>

        {asset.ticker && (
          <div className="margin-main">
            <div className="input-title basic500 tag1">
              {t('assetInfo.ticker')}
            </div>
            <div className="tag1">{asset.ticker}</div>
          </div>
        )}

        <div className="margin-main">
          <div className="input-title basic500 tag1">
            {t('assetInfo.precision')}
          </div>
          <div className="tag1">{asset.precision}</div>
        </div>

        <div className="margin-main">
          <div className="input-title basic500 tag1">
            {t('assetInfo.quantity')}
          </div>
          <div className="tag1">
            <Balance balance={new Money(asset.quantity, new Asset(asset))} />
          </div>
        </div>

        <div className="margin-main">
          <div className="input-title basic500 tag1">{t('assetInfo.type')}</div>
          <div className="tag1">
            {t(
              asset.reissuable
                ? 'assetInfo.reissuable'
                : 'assetInfo.notReissuable',
            )}
            ,&nbsp;
            {t(
              asset.hasScript ? 'assetInfo.scripted' : 'assetInfo.notScripted',
            )}
          </div>
        </div>

        {!!asset.minSponsoredFee && (
          <div className="margin-main">
            <div className="input-title basic500 tag1">
              {t('assetInfo.minSponsoredFee')}
            </div>
            <div className="tag1">{asset.minSponsoredFee}</div>
          </div>
        )}

        {asset.sender && (
          <div className="margin-main">
            <div className="input-title basic500 tag1">
              {t('assetInfo.sender')}
            </div>
            <div className="flex tag1">
              <Ellipsis text={asset.sender} size={14} />
              <Copy text={asset.sender}>
                <div className="copy-icon" onClick={onCopy} />
              </Copy>
            </div>
          </div>
        )}

        <div className="margin-main">
          <div className="input-title basic500 tag1">
            {t('assetInfo.timestamp')}
          </div>
          <div className="tag1">
            <DateFormat date={asset.timestamp} />
          </div>
        </div>

        {asset.originTransactionId && (
          <div className="center margin-main">
            <a
              rel="noopener noreferrer"
              className="link black"
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              href={getAssetDetailLink(networkCode!, asset.id)}
              target="_blank"
            >
              {t('assetInfo.viewDetailsInExplorer')}
            </a>
          </div>
        )}

        <Button type="button" onClick={onClose}>
          {t('assetInfo.closeBtn')}
        </Button>

        <Button
          className="modal-close"
          onClick={onClose}
          type="button"
          view="transparent"
        />
      </div>
    </div>
  );
}
