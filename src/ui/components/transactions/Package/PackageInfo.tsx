import * as React from 'react';
import { withTranslation } from 'react-i18next';
import * as styles from './package.styl';
import { getTransactionData } from './parseTx';
import {
  ComponentProps,
  Message,
  MessageData,
  TxIcon,
  TxInfo,
} from '../BaseTransaction';
import { AssetDetail } from 'ui/services/Background';
import { ComponentConfig } from 'ui/components/transactions/index';

const MessageItem = ({
  message,
  config,
  assets,
}: {
  message: Message;
  config: ComponentConfig;
  assets: Record<string, AssetDetail>;
}) => {
  const Card = config.card;
  return (
    <div>
      <Card message={message} assets={assets} />
      <TxInfo message={message} assets={assets} />
    </div>
  );
};

class PackageInfoComponent extends React.PureComponent<
  Pick<ComponentProps, 't' | 'message' | 'assets'> & {
    message: Message & { data: MessageData[]; lease?: unknown };
    onToggle?: (isOpen: boolean) => void;
  }
> {
  readonly state = { isOpened: false };

  toggleHandler = () => {
    const isOpened = !this.state.isOpened;
    this.setState({ isOpened });
  };

  componentDidUpdate(_, prevState): void {
    if (this.state.isOpened !== prevState.isOpened) {
      this.props.onToggle(this.state.isOpened);
    }
  }

  render() {
    const { t, message, assets } = this.props;
    const { isOpened } = this.state;
    const { data = [] as MessageData[] } = message;
    const txs = data.map(getTransactionData);
    const hashes = message.messageHash;
    return (
      <div>
        {isOpened
          ? txs.map(({ config, tx }, index) => {
              const message = {
                data: { ...tx, data: tx },
                messageHash: hashes[index],
                type: 'transaction',
              };
              return (
                <div key={`${index}${config.messageType}`}>
                  <MessageItem
                    config={config}
                    assets={assets}
                    message={message}
                  />
                </div>
              );
            })
          : null}

        <div className={styles.toggleList} onClick={this.toggleHandler}>
          <div className={styles.icons}>
            {txs.map(({ config }, index) => (
              <TxIcon
                className={styles.icon}
                txType={config.type}
                key={index}
              />
            ))}
          </div>
          <div className={styles.button}>
            <span>
              {t(
                isOpened
                  ? 'transactions.hideTransactions'
                  : 'transactions.showTransactions'
              )}
              <i className={isOpened ? styles.arrowUp : styles.arrowDown} />
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export const PackageInfo = withTranslation()(PackageInfoComponent);
