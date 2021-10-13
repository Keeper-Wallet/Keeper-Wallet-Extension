import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './package.styl';
import { getTransactionData } from './parseTx';
import { TxIcon } from '../TransactionIcon';

const MessageItem = ({ message, config, assets }) => {
    const Card = config.card;
    const Info = config.info;
    return (
        <div>
            <Card message={message} assets={assets} />
            <Info message={message} assets={assets} />
        </div>
    );
};

export class PackageInfo extends React.PureComponent<IPackInfo> {
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
        const { message, assets } = this.props;
        const { isOpened } = this.state;
        const { data = [] } = message;
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
                                  <MessageItem config={config} assets={assets} message={message} />
                              </div>
                          );
                      })
                    : null}

                <div className={styles.toggleList} onClick={this.toggleHandler}>
                    <div className={styles.icons}>
                        {txs.map(({ config }, index) => (
                            <TxIcon className={styles.icon} txType={config.type} key={index} />
                        ))}
                    </div>
                    <div className={styles.button}>
                        <span>
                            {isOpened ? (
                                <Trans i18nKey="transactions.hideTransactions">Hide transactions</Trans>
                            ) : (
                                <Trans i18nKey="transactions.showTransactions">Show transactions</Trans>
                            )}
                            <i className={isOpened ? styles.arrowUp : styles.arrowDown} />
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

interface IPackInfo {
    message: any;
    assets: any;
    onToggle?: (isOpen: boolean) => void;
}
