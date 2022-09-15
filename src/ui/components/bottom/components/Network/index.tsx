import cn from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import {
  withTranslation,
  useTranslation,
  WithTranslation,
} from 'react-i18next';
import {
  setLoading,
  setCustomCode,
  setCustomMatcher,
  setCustomNode,
  setNetwork,
} from 'ui/actions';
import { Modal } from 'ui/components/ui';
import { INetworkData, NetworkSettings } from '../NetworkSettings';
import * as styles from './network.styl';
import { Tooltip } from 'ui/components/ui/tooltip';
import { AppState } from 'ui/store';
import { NetworkName } from 'networks/types';

const key = (key: string) => `bottom.${key}`;

const Networks = ({
  isShow,
  onSelect,
  selectedNet,
  networks,
}: {
  isShow: boolean | undefined;
  selectedNet: string;
  networks: INetwork[];
  onSelect: (item: INetwork) => unknown;
}) => {
  const { t } = useTranslation();

  const classNames = cn(styles.selectNetworks, { [styles.isShow]: isShow });
  const nets = networks.reduce(
    (acc, item) => ((acc[item.name] = item), acc),
    Object.create(null)
  );
  const sortedNetworks = networks.filter(item => item.name !== selectedNet);
  if (nets[selectedNet]) {
    sortedNetworks.push(nets[selectedNet]);
  }
  return (
    <div className={classNames}>
      {sortedNetworks.map(net => {
        const currentNetwork = net.name;
        const selected = selectedNet === currentNetwork;
        const className = cn(styles.chooseNetwork, {
          [styles.selectedNet]: selected,
        });

        const onSelectNet = selected
          ? undefined
          : (ev: React.MouseEvent<HTMLDivElement>) => {
              ev.stopPropagation();
              onSelect(net);
            };

        return (
          <div onClick={onSelectNet} className={className} key={currentNetwork}>
            <i className={`networkIcon ${styles.networkIcon}`}> </i>
            <i className={`networkIconActive ${styles.networkIconActive}`}> </i>
            {t(key(currentNetwork))}
          </div>
        );
      })}
    </div>
  );
};

interface StateProps {
  currentNetwork: string;
  customCodes: Partial<Record<NetworkName, string | null>>;
  customMatcher: Record<string, unknown>;
  customNodes: Record<string, unknown>;
  networks: INetwork[];
}

interface DispatchProps {
  setNetwork: (net: NetworkName) => void;
  setCustomNode: (payload: {
    node: string;
    network: NetworkName | null | undefined;
  }) => void;
  setCustomMatcher: (payload: {
    matcher: string;
    network: NetworkName | null | undefined;
  }) => void;
  setCustomCode: (payload: {
    code: string;
    network: NetworkName | null | undefined;
  }) => void;
  setLoading: (show: boolean) => void;
}

type Props = WithTranslation &
  StateProps &
  DispatchProps & {
    noChangeNetwork: boolean | undefined;
  };

interface INetwork {
  name: string;
  code: string;
  server: string;
  matcher: string;
}

interface IState {
  networkHash: { [name: string]: INetwork } | null;
  net?: INetwork | null;
  showNetworks?: boolean;
  showEdit?: boolean;
  showSettings?: boolean;
}

class NetworkComponent extends React.PureComponent<Props, IState> {
  state: IState = {
    showNetworks: false,
    net: null,
    showEdit: false,
    networkHash: null,
    showSettings: false,
  };

  static getDerivedStateFromProps(
    props: Readonly<Props>,
    state: IState
  ): IState {
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

  selectHandler = ({ name }: INetwork) => {
    this.clickOutHandler();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const net = this.state.networkHash![name];

    if (net && (!net.server || !net.matcher)) {
      this.setState({ net, showSettings: true });
    } else {
      this.setNewNetwork(name as NetworkName);
    }
  };

  editClickHandler = () =>
    this.setState({
      showSettings: !this.props.noChangeNetwork,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      net: this.state.networkHash![this.props.currentNetwork],
    });

  setNewNetwork = (net: NetworkName | null | undefined) => {
    if (net) {
      this.props.setLoading(true);
      setTimeout(() => this.props.setLoading(false), 1000);
      this.props.setNetwork(net);
    }
  };

  saveSettingsHandler = ({ matcher, node, code, name }: INetworkData) => {
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

  resetSettingsHandler = () => {
    this.setState({ net: null });
  };

  closeSettingsHandler = () => {
    this.setState({ showSettings: false });
  };

  clickOutHandler = () => {
    this.setState({ showNetworks: false, net: null });
    this.removeClickOutHandler();
  };

  componentWillUnmount() {
    this.removeClickOutHandler();
  }

  removeClickOutHandler() {
    document.removeEventListener('click', this.clickOutHandler, {
      capture: true,
    });
  }

  addClickOutHandler() {
    document.addEventListener('click', this.clickOutHandler, { capture: true });
  }

  render(): React.ReactNode {
    const networkClassName = cn(
      'basic500',
      this.props.noChangeNetwork && styles.disabledNet
    );

    const { t } = this.props;
    const {
      networkHash,
      showSettings,
      net: selectedNet,
      showNetworks,
      showEdit,
    } = this.state;
    const currentNetwork = this.props.currentNetwork || 'mainnet';
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const net = selectedNet ? networkHash![selectedNet.name] : null;

    return (
      <Tooltip
        className={styles.tooltipContent}
        content={t('bottom.network.disabled')}
      >
        {props => (
          <div
            className={`${styles.network} flex`}
            {...(this.props.noChangeNetwork && props)}
          >
            <div
              className={`${networkClassName} flex`}
              onClick={this.selectFromNetworksHandler}
              key={currentNetwork}
            >
              <i className={`networkIcon ${styles.networkIcon}`}> </i>
              <span className={styles.networkBottom}>
                {t(key(currentNetwork))}
              </span>
            </div>
            {showEdit ? (
              <div
                className={cn(
                  styles.editBtn,
                  this.props.noChangeNetwork && styles.disabledNet
                )}
                onClick={this.editClickHandler}
              >
                {t('bottom.network.edit')}
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
              onExited={this.resetSettingsHandler}
            >
              <NetworkSettings
                node={net && net.server}
                name={net && (net.name as NetworkName)}
                matcher={net && net.matcher}
                networkCode={net && net.code}
                onClose={this.closeSettingsHandler}
                onSave={this.saveSettingsHandler}
              />
            </Modal>
          </div>
        )}
      </Tooltip>
    );
  }
}

const mapStateToProps = ({
  currentNetwork,
  networks,
  customNodes,
  customMatcher,
  customCodes,
}: AppState): StateProps => ({
  currentNetwork,
  customMatcher,
  customCodes,
  customNodes,
  networks,
});

const actions = {
  setNetwork,
  setLoading,
  setCustomNode,
  setCustomMatcher,
  setCustomCode,
};

export const Network = connect(
  mapStateToProps,
  actions
)(withTranslation()(NetworkComponent));
