import clsx from 'clsx';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { getMoney } from '../../../utils/converters';
import { Asset, Balance } from '../../ui';
import { TxIcon } from '../BaseTransaction';
import { MessageCardComponentProps } from '../types';
import { getAssetFee, SPONSOR_MODE } from './parseTx';
import * as styles from './sponsorship.styl';

class SponsorshipCardComponent extends PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = clsx(
      styles.sponsorshipTransactionCard,
      this.props.className,
      {
        [styles.sponsorshipCardCollapsed]: this.props.collapsed,
      }
    );

    const { t, message, assets, collapsed } = this.props;

    const { data } = message as Extract<
      typeof message,
      { type: 'transaction' }
    >;

    const tx = { type: data?.type, ...data?.data };
    const assetFee = getMoney(getAssetFee(tx), assets);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const isSetSponsored = assetFee!.getTokens().gt(0);

    return (
      <>
        <div className={className}>
          <div className={styles.cardHeader}>
            <div className={styles.sponsorshipTxIcon}>
              <TxIcon
                txType={
                  isSetSponsored ? SPONSOR_MODE.enable : SPONSOR_MODE.disable
                }
              />
            </div>
            <div>
              <div
                className="basic500 body3 margin-min"
                data-testid="sponsorshipTitle"
              >
                {t(
                  isSetSponsored
                    ? 'transactions.setSponsored'
                    : 'transactions.clearSponsored'
                )}
              </div>
              <h1 className="headline1">
                {isSetSponsored ? (
                  <Balance
                    data-testid="sponsorshipAmount"
                    split
                    showAsset
                    balance={assetFee}
                    showUsdAmount
                  />
                ) : (
                  <Asset
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    assetId={assetFee!.asset.id}
                    data-testid="sponsorshipAsset"
                  />
                )}
              </h1>
            </div>
          </div>
        </div>
        {!collapsed && isSetSponsored && (
          <div className="tag1 basic500 margin-min margin-main-top">
            {t('transactions.amountPerTransaction')}
          </div>
        )}
      </>
    );
  }
}

export const SponsorshipCard = withTranslation()(SponsorshipCardComponent);
