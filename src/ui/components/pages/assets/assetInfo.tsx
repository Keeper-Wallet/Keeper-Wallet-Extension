import { Trans } from 'react-i18next';
import { Button, Copy, DateFormat, Ellipsis } from '../../ui';
import * as React from 'react';
import { Asset } from '@waves/data-entities';

interface Props {
  asset: Asset;
  onCopy: () => void;
  onClose: () => void;
}

export function AssetInfo({ asset, onCopy, onClose }: Props) {
  return (
    <div className="modal cover">
      <div className="modal-form">
        <div className="margin-main">
          <div className="input-title basic500 tag1">
            <Trans i18nKey="todo">ID</Trans>
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
            <Trans i18nKey="todo">Name</Trans>
          </div>
          <div className="tag1">{asset.displayName}</div>
        </div>

        {!!asset.ticker && (
          <div className="margin-main">
            <div className="input-title basic500 tag1">
              <Trans i18nKey="todo">Ticker</Trans>
            </div>
            <div className="tag1">{asset.ticker}</div>
          </div>
        )}

        <div className="margin-main">
          <div className="input-title basic500 tag1">
            <Trans i18nKey="todo">Decimals points</Trans>
          </div>
          <div className="tag1">{asset.precision}</div>
        </div>

        <div className="margin-main">
          <div className="input-title basic500 tag1">
            <Trans i18nKey="todo">Total issued</Trans>
          </div>
          <div className="tag1">{asset.quantity}</div>
        </div>

        <div className="margin-main">
          <div className="input-title basic500 tag1">
            <Trans i18nKey="todo">Type</Trans>
          </div>
          <div className="tag1">
            <Trans i18nKey="todo">
              {!!asset.reissuable ? 'Reissuable' : 'Non reissuable'}
              {asset.hasScript ? ', Scripted' : ', Not scripted'}
            </Trans>
          </div>
        </div>

        {!!asset.minSponsoredFee && (
          <div className="margin-main">
            <div className="input-title basic500 tag1">
              <Trans i18nKey="todo">Sponsored Asset Fee</Trans>
            </div>
            <div className="tag1">{asset.minSponsoredFee}</div>
          </div>
        )}

        <div className="margin-main">
          <div className="input-title basic500 tag1">
            <Trans i18nKey="todo">Issuer</Trans>
          </div>
          <div className="flex tag1">
            <Ellipsis text={asset.sender} size={14} />
            <Copy text={asset.sender}>
              <div className="copy-icon" onClick={onCopy} />
            </Copy>
          </div>
        </div>

        <div className="margin-main">
          <div className="input-title basic500 tag1">
            <Trans i18nKey="todo">Issue date</Trans>
          </div>
          <div className="tag1">
            <DateFormat value={asset.timestamp} />
          </div>
        </div>

        <Button onClick={onClose} type="button">
          <Trans i18nKey="close" />
        </Button>
      </div>
    </div>
  );
}
