import { Trans } from 'react-i18next';
import { Balance, Button, Copy, DateFormat, Ellipsis } from '../../ui';
import * as React from 'react';
import { Asset, Money } from '@waves/data-entities';
import { useAppSelector } from '../../../store';
import { AssetDetail } from '../../../services/Background';
import { getAssetDetailLink } from '../../../urls';

interface Props {
  asset: AssetDetail;
  onCopy: () => void;
  onClose: () => void;
}

export function AssetInfo({ asset, onCopy, onClose }: Props) {
  const networkCode = useAppSelector(
    state => state.selectedAccount.networkCode
  );

  return (
    <div className="modal cover">
      <div className="modal-form">
        <Button className="modal-close" onClick={onClose} type="transparent" />

        <div className="margin-main">
          <div className="input-title basic500 tag1">
            <Trans i18nKey="assetInfo.id" />
          </div>
          <div className="flex tag1">
            <Ellipsis text={asset.id} size={14} />
            <Copy text={asset.id}>
              <div className="copy-icon" onClick={onCopy} />
            </Copy>
          </div>
        </div>

        <div className="margin-main">
          <div className="input-title basic500 tag1">
            <Trans i18nKey="assetInfo.displayName" />
          </div>
          <div className="tag1">{asset.displayName}</div>
        </div>

        {asset.ticker && (
          <div className="margin-main">
            <div className="input-title basic500 tag1">
              <Trans i18nKey="assetInfo.ticker" />
            </div>
            <div className="tag1">{asset.ticker}</div>
          </div>
        )}

        <div className="margin-main">
          <div className="input-title basic500 tag1">
            <Trans i18nKey="assetInfo.precision" />
          </div>
          <div className="tag1">{asset.precision}</div>
        </div>

        <div className="margin-main">
          <div className="input-title basic500 tag1">
            <Trans i18nKey="assetInfo.quantity" />
          </div>
          <div className="tag1">
            <Balance balance={new Money(asset.quantity, new Asset(asset))} />
          </div>
        </div>

        <div className="margin-main">
          <div className="input-title basic500 tag1">
            <Trans i18nKey="assetInfo.type" />
          </div>
          <div className="tag1">
            <Trans
              i18nKey={
                asset.reissuable
                  ? 'assetInfo.reissuable'
                  : 'assetInfo.notReissuable'
              }
            />
            ,&nbsp;
            <Trans
              i18nKey={
                asset.hasScript ? 'assetInfo.scripted' : 'assetInfo.notScripted'
              }
            />
          </div>
        </div>

        {!!asset.minSponsoredFee && (
          <div className="margin-main">
            <div className="input-title basic500 tag1">
              <Trans i18nKey="assetInfo.minSponsoredFee" />
            </div>
            <div className="tag1">{asset.minSponsoredFee}</div>
          </div>
        )}

        {asset.sender && (
          <div className="margin-main">
            <div className="input-title basic500 tag1">
              <Trans i18nKey="assetInfo.sender" />
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
            <Trans i18nKey="assetInfo.timestamp" />
          </div>
          <div className="tag1">
            <DateFormat value={asset.timestamp} />
          </div>
        </div>

        {asset.originTransactionId && (
          <div className="center margin-main">
            <a
              rel="noopener noreferrer"
              className="link black"
              href={getAssetDetailLink(networkCode, asset.originTransactionId)}
              target="_blank"
            >
              <Trans i18nKey="assetInfo.viewDetailsInExplorer" />
            </a>
          </div>
        )}

        <Button onClick={onClose} type="button">
          <Trans i18nKey="assetInfo.closeBtn" />
        </Button>
      </div>
    </div>
  );
}
