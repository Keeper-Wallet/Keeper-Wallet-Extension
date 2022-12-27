import clsx from 'clsx';
import { NetworkName } from 'networks/types';
import { PopupState } from 'popup/store/types';
import { PureComponent } from 'react';
import {
  useTranslation,
  WithTranslation,
  withTranslation,
} from 'react-i18next';
import { connect } from 'react-redux';
import { setLoading } from 'store/actions/localState';
import {
  setCustomCode,
  setCustomMatcher,
  setCustomNode,
  setNetwork,
} from 'store/actions/network';
import { Modal } from 'ui/components/ui';
import { Tooltip } from 'ui/components/ui/tooltip';

import { NETWORK_CONFIG, NetworkConfigItem } from '../../../../../constants';
import { INetworkData, NetworkSettings } from '../NetworkSettings';
import * as styles from './network.styl';

// eslint-disable-next-line @typescript-eslint/no-shadow
const key = (key: string) => `bottom.${key}`;

const Networks = ({
  isShow,
  networks,
  selectedNet,
  onSelect,
}: {
  isShow: boolean | undefined;
  networks: NetworkConfigItem[];
  selectedNet: string;
  onSelect: (item: NetworkConfigItem) => unknown;
}) => {
  const { t } = useTranslation();

  const nets = networks.reduce(
    (acc, item) => ((acc[item.name] = item), acc),
    Object.create(null)
  );

  const sortedNetworks = networks.filter(item => item.name !== selectedNet);

  if (nets[selectedNet]) {
    sortedNetworks.push(nets[selectedNet]);
  }

  return (
    <div className={clsx(styles.selectNetworks, { [styles.isShow]: isShow })}>
      {sortedNetworks.map(net => {
        const currentNetwork = net.name;
        const selected = selectedNet === currentNetwork;
        const className = clsx(styles.chooseNetwork, {
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

interface DispatchProps {
  setNetwork: (net: NetworkName) => Promise<void>;
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
  ReturnType<typeof mapStateToProps> &
  DispatchProps & {
    allowChangingNetwork: boolean | undefined;
  };

interface IState {
  net?: NetworkConfigItem | null;
  networkHash: typeof NETWORK_CONFIG | null;
  showEdit?: boolean;
  showNetworks?: boolean;
  showSettings?: boolean;
}

class NetworkComponent extends PureComponent<Props, IState> {
  state: IState = {
    showNetworks: false,
    net: null,
    showEdit: false,
    networkHash: null,
    showSettings: false,
  };

  static getDerivedStateFromProps(
    { currentNetwork, customMatcher, customNodes }: Readonly<Props>,
    state: IState
  ): IState {
    const networkHash = Object.values(NETWORK_CONFIG).reduce((acc, network) => {
      acc[network.name] = {
        matcherBaseUrl: customMatcher[network.name] || network.matcherBaseUrl,
        name: network.name,
        networkCode: network.networkCode,
        nodeBaseUrl: customNodes[network.name] || network.nodeBaseUrl,
      };

      return acc;
    }, {} as typeof NETWORK_CONFIG);

    return {
      showEdit: currentNetwork === 'custom' && !state.showSettings,
      networkHash,
    };
  }

  selectFromNetworksHandler = () => {
    this.addClickOutHandler();
    this.setState({ showNetworks: this.props.allowChangingNetwork, net: null });
  };

  selectHandler = ({ name }: NetworkConfigItem) => {
    this.clickOutHandler();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const net = this.state.networkHash![name];

    if (net && (!net.nodeBaseUrl || !net.matcherBaseUrl)) {
      this.setState({ net, showSettings: true });
    } else {
      this.setNewNetwork(name);
    }
  };

  editClickHandler = () =>
    this.setState({
      showSettings: this.props.allowChangingNetwork,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      net: this.state.networkHash![this.props.currentNetwork],
    });

  setNewNetwork = async (net: NetworkName | null | undefined) => {
    if (net) {
      this.props.setLoading(true);
      setTimeout(() => this.props.setLoading(false), 1000);
      await this.props.setNetwork(net);
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
    const networkClassName = clsx(
      'basic500',
      !this.props.allowChangingNetwork && styles.disabledNet
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
            {...(!this.props.allowChangingNetwork ? props : undefined)}
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
                className={clsx(
                  styles.editBtn,
                  !this.props.allowChangingNetwork && styles.disabledNet
                )}
                onClick={this.editClickHandler}
              >
                {t('bottom.network.edit')}
              </div>
            ) : null}
            <Networks
              isShow={showNetworks}
              networks={Object.values(NETWORK_CONFIG)}
              selectedNet={this.props.currentNetwork}
              onSelect={this.selectHandler}
            />

            <Modal
              showModal={showSettings}
              animation={Modal.ANIMATION.FLASH}
              onExited={this.resetSettingsHandler}
            >
              <NetworkSettings
                node={net && net.nodeBaseUrl}
                name={net && net.name}
                matcher={net && net.matcherBaseUrl}
                networkCode={net && net.networkCode}
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
  customNodes,
  customMatcher,
  customCodes,
}: PopupState) => ({ currentNetwork, customMatcher, customCodes, customNodes });

export const Network = connect(mapStateToProps, {
  setNetwork,
  setLoading,
  setCustomNode,
  setCustomMatcher,
  setCustomCode,
})(withTranslation()(NetworkComponent));
