import * as styles from './customData.styl';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { ShowScript } from '../../ui';
import { MessageCardComponentProps } from '../types';

class CustomDataCardComponent extends React.PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = cn(styles.dataTransactionCard, this.props.className, {
      [styles.dataCardCollapsed]: this.props.collapsed,
    });

    const { t, message } = this.props;

    const { data } = message as Extract<typeof message, { type: 'customData' }>;

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.dataTxIcon}>
            <TxIcon txType={'authOrigin'} small={true} />
          </div>
          <div>
            <div className="basic500 body3 margin-min">
              {t('sign.customData')}
            </div>
            <h1 className="headline1">{t('sign.customDataName')}</h1>
          </div>
        </div>

        <div className={`${styles.cardContent} marginTop1`}>
          <ShowScript
            className={styles.dataScript}
            data={(data.version === 2 && data.data) || []}
            script={(data.version === 1 && data.binary) || ''}
            isData={data.version === 2 && !!data.data}
            optional={true}
            showNotify={true}
            hideScript={this.props.collapsed}
          />
        </div>
      </div>
    );
  }
}

export const CustomDataCard = withTranslation()(CustomDataCardComponent);
