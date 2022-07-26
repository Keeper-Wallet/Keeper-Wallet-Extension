import * as styles from './setScript.styl';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import cn from 'classnames';
import { ShowScript } from '../../ui';
import { SetScriptCardHeader } from './SetScriptCardHeader';
import { MessageCardComponentProps } from '../types';

class SetScriptCardComponent extends React.PureComponent<
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
    const { data = {} } = message;
    const tx = { type: data.type, ...data.data };
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
              showNotify={true}
              hideScript={this.props.collapsed}
            />
          </div>
        </div>
        {!collapsed ? (
          <>
            <div className="font600 tag1 basic500 margin-min margin-main-top">
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
