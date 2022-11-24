import cn from 'classnames';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { Asset, ShowScript } from '../../ui';
import { TxIcon } from '../BaseTransaction';
import { MessageCardComponentProps } from '../types';
import * as styles from './assetScript.styl';
import { messageType } from './parseTx';

class AssetScriptCardComponent extends PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = cn(
      styles.assetScriptTransactionCard,
      this.props.className,
      {
        [styles.assetScriptCardCollapsed]: this.props.collapsed,
      }
    );

    const { t, message, collapsed } = this.props;

    const { data } = message as Extract<
      typeof message,
      { type: 'transaction' }
    >;

    const tx = { type: data?.type, ...data?.data };
    const script = tx.script;

    return (
      <>
        <div className={className}>
          <div className={styles.cardHeader}>
            <div className={styles.assetScriptTxIcon}>
              <TxIcon txType={messageType} />
            </div>
            <div>
              <div className="basic500 body3 margin-min">
                {t('transactions.assetScriptTransaction')}
              </div>
              <h1 className="headline1">
                <Asset assetId={tx.assetId} data-testid="setAssetScriptAsset" />
              </h1>
            </div>
          </div>

          <div className={cn(styles.cardContent, 'marginTop1')}>
            <ShowScript
              script={script}
              showNotify
              hideScript={this.props.collapsed}
            />
          </div>
        </div>
        {!collapsed ? (
          <>
            <div className="font600 tag1 basic500 margin-min margin-main-top">
              {t('transactions.assetScriptWarningHeader')}
            </div>

            <div className="tag1 basic500 margin-main">
              {t('transactions.assetScriptWarningDescription')}
            </div>
          </>
        ) : null}
      </>
    );
  }
}

export const AssetScriptCard = withTranslation()(AssetScriptCardComponent);
