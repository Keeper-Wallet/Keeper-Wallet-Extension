import * as styles from './customData.styl';
import * as React from 'react';
import { withTranslation } from 'react-i18next';
import { ComponentProps, MessageData, TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { EntryNoKey, EntryWithKey, ShowScript } from '../../ui';

class CustomDataCardComponent extends React.PureComponent<ComponentProps> {
  render() {
    const className = cn(styles.dataTransactionCard, this.props.className, {
      [styles.dataCardCollapsed]: this.props.collapsed,
    });

    const { t, message } = this.props;
    const { data = {} as MessageData } = message;
    const { data: dataToShow, binary } = data;
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
            data={
              (dataToShow as unknown as
                | Array<EntryWithKey>
                | Array<EntryNoKey>) || []
            }
            script={binary || ''}
            isData={!!dataToShow}
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
