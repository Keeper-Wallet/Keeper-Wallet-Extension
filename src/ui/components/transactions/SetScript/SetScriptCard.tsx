import cn from 'classnames';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { ShowScript } from '../../ui';
import { MessageCardComponentProps } from '../types';
import * as styles from './setScript.styl';
import { SetScriptCardHeader } from './SetScriptCardHeader';

class SetScriptCardComponent extends PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = cn(
      styles.setScriptTransactionCard,
      this.props.className,
      {
        [styles.setScriptCardCollapsed]: this.props.collapsed,
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
          <SetScriptCardHeader script={script} />

          <div
            className={
              script ? `${styles.cardContent} marginTop1` : styles.cardContent
            }
          >
            <ShowScript
              script={script}
              showNotify
              hideScript={this.props.collapsed}
            />
          </div>
        </div>
        {!collapsed ? (
          <>
            <div className="font700 tag1 basic500 margin-min margin-main-top">
              {t('transactions.scriptWarningHeader')}
            </div>

            <div className="tag1 basic500 margin-main">
              {t('transactions.scriptWarningDescription')}
            </div>
          </>
        ) : null}
      </>
    );
  }
}

export const SetScriptCard = withTranslation()(SetScriptCardComponent);
