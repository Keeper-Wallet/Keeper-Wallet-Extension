import cn from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import { loading, setCustomCode, setCustomMatcher, setCustomNode, setNetwork } from 'ui/actions';
import { Modal } from 'ui/components/ui';
import { NetworkSettings } from '../NetworkSettings';
import * as styles from './network.styl';

const key = (key) => `bottom.${key}`;

const Networks = ({ isShow, onSelect, selectedNet, networks }) => {
    const classNames = cn(styles.selectNetworks, { [styles.isShow]: isShow });
    const nets = networks.reduce((acc, item) => ((acc[item.name] = item), acc), Object.create(null));
    const sortedNetworks = networks.filter((item) => item.name !== selectedNet);
    if (nets[selectedNet]) {
        sortedNetworks.push(nets[selectedNet]);
    }
    return (
        <div className={classNames}>
            {sortedNetworks.map((net) => {
                const currentNetwork = net.name;
                const selected = selectedNet === currentNetwork;
                const className = cn(styles.chooseNetwork, {
                    [styles.selectedNet]: selected,
                });

                const onSelectNet = selected
                    ? null
                    : (ev) => {
                          ev.stopPropagation();
                          onSelect(net);
                      };

                return (
                    <div onClick={onSelectNet} className={className} key={currentNetwork}>
                        <i className={`networkIcon ${styles.networkIcon}`}></i>
                        <i className={`networkIconActive ${styles.networkIconActive}`}></i>
                        <Trans i18nKey={key(currentNetwork)}>{currentNetwork}</Trans>
                    </div>
                );
            })}
        </div>
    );
};

class NetworkComponent extends React.PureComponent<INetworkProps, IState> {
    state = { showNetworks: false, net: null, showEdit: false, networkHash: null, showSettings: false, lastNet: null };

    static getDerivedStateFromProps(props: INetworkProps, state: IState): IState {
        const networkHash = props.networks.reduce((acc, network) => {
            const { code, matcher, name, server } = network;
            const { customMatcher, customNodes } = props;

            acc[name] = {
                name: name,
                code: code,
                server: customNodes[name] || server,
                matcher: customMatcher[name] || matcher,
            };

            return acc;
        }, Object.create(null));

        return {
            showEdit: props.currentNetwork === 'custom' && !state.showSettings,
            networkHash,
        };
    }

    selectFromNetworksHandler = () => {
        this.addClickOutHandler();
        this.setState({ showNetworks: !this.props.noChangeNetwork, net: null });
    };

    selectHandler = ({ name }) => {
        this.clickOutHandler();

        const net = this.state.networkHash[name];

        if (net && (!net.server || !net.matcher)) {
            this.setState({ net, showSettings: true });
        } else {
            this.setNewNetwork(name);
        }
    };

    editClickHandler = () =>
        this.setState({
            showSettings: true,
            net: this.state.networkHash[this.props.currentNetwork],
        });

    setNewNetwork = (net) => {
        if (net) {
            this.props.loading(true);
            setTimeout(() => this.props.loading(false), 1000);
            this.props.setNetwork(net);
        }
    };

    saveSettingsHandler = ({ matcher, node, code, name }) => {
        if (matcher) {
            this.props.setCustomMatcher({ matcher, network: name });
        }

        if (node) {
            this.props.setCustomNode({ node, network: name });
        }

        if (code) {
            this.props.setCustomCode({ code, network: name });
        }

        this.setState({ net: null, showSettings: false });
        if (name !== this.props.currentNetwork) {
            this.setNewNetwork(name);
        }
    };

    clickOutHandler = () => {
        this.setState({ showNetworks: false, net: null });
        this.removeClickOutHandler();
    };

    componentWillUnmount() {
        this.removeClickOutHandler();
    }

    removeClickOutHandler() {
        document.removeEventListener('click', this.clickOutHandler);
    }

    addClickOutHandler() {
        document.addEventListener('click', this.clickOutHandler);
    }

    render(): React.ReactNode {
        const networkClassName = cn('basic500', {
            [styles.disabledNet]: this.props.noChangeNetwork,
        });

        const { networkHash, showSettings, net: selectedNet, showNetworks, showEdit } = this.state;
        const currentNetwork = this.props.currentNetwork || 'mainnet';
        const net = selectedNet ? networkHash[selectedNet.name] : null;

        return (
            <div className={`${styles.network} flex`}>
                <div
                    className={`${networkClassName} flex`}
                    onClick={this.selectFromNetworksHandler}
                    key={currentNetwork}
                >
                    <i className={`networkIcon ${styles.networkIcon}`}></i>
                    <span className={styles.networkBottom}>
                        <Trans i18nKey={key(currentNetwork)}>{currentNetwork}</Trans>
                    </span>
                </div>
                {showEdit ? (
                    <div className={styles.editBtn} onClick={this.editClickHandler}>
                        <Trans i18nKey="bottom.network.edit">Edit</Trans>
                    </div>
                ) : null}
                <Networks
                    isShow={showNetworks}
                    networks={this.props.networks}
                    selectedNet={this.props.currentNetwork}
                    onSelect={this.selectHandler}
                />

                <Modal
                    showModal={showSettings}
                    animation={Modal.ANIMATION.FLASH}
                    onExited={() => this.setState({ net: null })}
                >
                    <NetworkSettings
                        node={net && net.server}
                        name={net && net.name}
                        matcher={net && net.matcher}
                        networkCode={net && net.code}
                        onClose={() => this.setState({ showSettings: false })}
                        onSave={this.saveSettingsHandler}
                    />
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = ({ currentNetwork, networks, customNodes, customMatcher, customCodes }) => ({
    currentNetwork,
    customMatcher,
    customCodes,
    customNodes,
    networks,
});

const actions = {
    setNetwork,
    loading,
    setCustomNode,
    setCustomMatcher,
    setCustomCode,
};

export const Network = connect(mapStateToProps, actions)(NetworkComponent);

interface INetworkProps {
    className?: string;
    noChangeNetwork: boolean;
    currentNetwork: string;
    networks: Array<INetwork>;
    customNodes;
    customMatcher;
    setNetwork: (net: string) => void;
    loading: (show: boolean) => void;
    setCustomNode: (payload: { node: string; network: string }) => void;
    setCustomMatcher: (payload: { matcher: string; network: string }) => void;
    setCustomCode: (payload: { code: string; network: string }) => void;
}

interface INetwork {
    name: string;
    code: string;
    server: string;
    matcher: string;
}

interface IState {
    networkHash: { [name: string]: INetwork };
    net?: INetwork;
    showNetworks?: boolean;
    showEdit?: boolean;
    showSettings?: boolean;
    lastNet?: string;
}
