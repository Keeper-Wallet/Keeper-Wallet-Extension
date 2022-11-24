import { AssetsRecord } from 'assets/types';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { TxIcon, TxInfo } from '../BaseTransaction';
import { MessageComponentProps, MessageConfig } from '../types';
import * as styles from './package.styl';
import { getTransactionData } from './parseTx';

const MessageItem = ({
  message,
  config,
  assets,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
  config: MessageConfig;
  assets: AssetsRecord;
}) => {
  const Card = config.card;
  return (
    <div>
      <Card message={message} assets={assets} />
      <TxInfo message={message} />
    </div>
  );
};

interface State {
  isOpened: boolean;
}

type Props = Pick<MessageComponentProps, 'message' | 'assets'> &
  WithTranslation & {
    onToggle: (isOpen: boolean) => void;
  };

class PackageInfoComponent extends PureComponent<Props, State> {
  state: State = { isOpened: false };

  toggleHandler = () => {
    const isOpened = !this.state.isOpened;
    this.setState({ isOpened });
  };

  componentDidUpdate(_: Props, prevState: State): void {
    if (this.state.isOpened !== prevState.isOpened) {
      this.props.onToggle(this.state.isOpened);
    }
  }

  render() {
    const { t, message, assets } = this.props;
    const { isOpened } = this.state;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data = [] as any } = message;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const txs = (data as any[]).map(getTransactionData);
    const hashes = message.messageHash;
    return (
      <div>
        {isOpened
          ? txs.map(({ config, tx }, index) => {
              // eslint-disable-next-line @typescript-eslint/no-shadow
              const message = {
                data: { ...tx, data: tx },
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                messageHash: hashes![index],
                type: 'transaction',
              };
              return (
                <div
                  key={`${index}${config.messageType}`}
                  data-testid="packageItem"
                >
                  <MessageItem
                    config={config}
                    assets={assets}
                    message={message}
                  />
                </div>
              );
            })
          : null}

        <div
          className={styles.toggleList}
          data-testid="packageDetailsToggle"
          onClick={this.toggleHandler}
        >
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
