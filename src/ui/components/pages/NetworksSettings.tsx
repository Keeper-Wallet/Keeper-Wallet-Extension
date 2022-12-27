import { NetworkName } from 'networks/types';
import { PopupState } from 'popup/store/types';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { getMatcherPublicKey, getNetworkByte } from 'ui/utils/waves';

import { NETWORK_CONFIG } from '../../../constants';
import {
  setCustomCode,
  setCustomMatcher,
  setCustomNode,
} from '../../../store/actions/network';
import { Button, Copy, ErrorMessage, Input, Modal } from '../ui';
import * as styles from './styles/settings.styl';

interface DispatchProps {
  setCustomNode: (payload: {
    node: string | null | undefined;
    network: NetworkName;
  }) => void;
  setCustomMatcher: (payload: {
    network: NetworkName;
    matcher: string | null | undefined;
  }) => void;
  setCustomCode: (payload: {
    code: string | undefined;
    network: NetworkName;
  }) => void;
}

type Props = WithTranslation & ReturnType<typeof mapToProps> & DispatchProps;

interface State {
  currentMatcher?: string | null;
  currentNode?: string | null;
  defaultMatcher?: string;
  defaultNode?: string;
  hasChanges?: string | boolean;
  hasChangesMatcher?: string | boolean;
  isCurrent?: boolean | '' | null;
  isCurrentMatcher?: boolean | '' | null;
  isDefault?: boolean;
  isDefaultMatcher?: boolean;
  newCode?: string;
  node?: string;
  nodeError?: boolean;
  matcher?: string;
  matcherError?: boolean;
  showCopied?: boolean;
  showSaved?: boolean;
  showSetDefault?: boolean;
  showSetDefaultBtn?: boolean;
  validateData?: boolean;
}

class NetworksSettingsComponent extends PureComponent<Props, State> {
  state: State = {};
  _tCopy: ReturnType<typeof setTimeout> | undefined;
  _tSave: ReturnType<typeof setTimeout> | undefined;
  _tSetDefault: ReturnType<typeof setTimeout> | undefined;

  static getDerivedStateFromProps(
    { currentNetwork, customMatcher, customNodes }: Readonly<Props>,
    state: State
  ): Partial<State> | null {
    state = { ...state };

    const defaultServers = NETWORK_CONFIG[currentNetwork];

    const defaultNode = defaultServers.nodeBaseUrl;
    const currentNode = customNodes[currentNetwork];
    const isDefault = state.node === defaultNode;
    const isCurrent = currentNode && state.node === currentNode;
    const hasChanges =
      state.node && ((isDefault && currentNode) || (!isCurrent && !isDefault));
    const node =
      hasChanges || state.node != null
        ? state.node
        : currentNode || defaultNode;
    const defaultMatcher = defaultServers.matcherBaseUrl;
    const currentMatcher = customMatcher[currentNetwork];
    const isDefaultMatcher = state.matcher === defaultMatcher;
    const isCurrentMatcher = currentMatcher && state.matcher === currentMatcher;
    const hasChangesMatcher =
      state.matcher &&
      ((isDefaultMatcher && currentMatcher) ||
        (!isCurrentMatcher && !isDefaultMatcher));
    const matcher =
      hasChangesMatcher || state.matcher != null
        ? state.matcher
        : currentMatcher || defaultMatcher;

    return {
      node,
      defaultNode,
      currentNode,
      hasChanges,
      isDefault,
      isCurrent,
      matcher,
      defaultMatcher,
      currentMatcher,
      hasChangesMatcher,
      isDefaultMatcher,
      isCurrentMatcher,
      showSetDefaultBtn: currentNetwork !== 'custom',
    };
  }

  onInputHandler = (event: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ node: event.target.value, nodeError: false });

  onInputMatcherHandler = (event: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ matcher: event.target.value, matcherError: false });

  onSaveNodeHandler = async () => {
    this.setState({ validateData: true });
    try {
      await this.validate();
      this.saveNode();
      this.saveMatcher();
      this.saveCode();
      this.onSave();
    } catch (e) {
      // ignore
    }
    this.setState({ validateData: false });
  };

  saveDefault = () => {
    this.setDefaultNode();
    this.setDefaultMatcher();
    this.onSaveDefault();
  };

  copyHandler = () => this.onCopy();

  async validate() {
    let hasErrors = false;
    const { node, matcher } = this.state;
    const { currentNetwork } = this.props;
    const { networkCode } = NETWORK_CONFIG[currentNetwork];

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newCode = await getNetworkByte(node!);
      this.setState({ newCode });
      if (networkCode && networkCode !== newCode) {
        throw new Error('Incorrect node network byte');
      }
    } catch (e) {
      this.setState({ nodeError: true });
      hasErrors = true;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await getMatcherPublicKey(matcher!);
    } catch (e) {
      this.setState({ matcherError: true });
      hasErrors = true;
    }

    if (hasErrors) {
      throw new Error('invalid node or matcher');
    }
  }

  render() {
    const { nodeError, matcherError, validateData, showSetDefaultBtn } =
      this.state;
    const { t } = this.props;

    const disableSave = nodeError || matcherError || validateData;
    const disableForm = validateData;

    return (
      <div className={styles.networkTab}>
        <h2 className="title1 margin-main-big">
          {t('networksSettings.network')}
        </h2>

        <div className="margin-main-big relative">
          <label className="input-title basic500 tag1" htmlFor="node_address">
            <Copy text={this.state.node} onCopy={this.copyHandler}>
              <i className={`copy-icon ${styles.copyIcon}`}> </i>
            </Copy>
            {t('networksSettings.node')}
          </label>
          <Input
            disabled={!!disableForm}
            id="node_address"
            value={this.state.node}
            onChange={this.onInputHandler}
          />
          <ErrorMessage show={nodeError} data-testid="nodeAddressError">
            {t('networkSettings.nodeError')}
          </ErrorMessage>
        </div>

        <div className="margin-main-big relative">
          <label
            className="input-title basic500 tag1"
            htmlFor="matcher_address"
          >
            <Copy text={this.state.matcher} onCopy={this.copyHandler}>
              <i className={`copy-icon ${styles.copyIcon}`}> </i>
            </Copy>
            {t('networksSettings.matcher')}
          </label>
          <Input
            disabled={!!disableForm}
            id="matcher_address"
            value={this.state.matcher}
            onChange={this.onInputMatcherHandler}
          />
          <ErrorMessage show={matcherError}>
            {t('networkSettings.matcherError')}
          </ErrorMessage>
        </div>

        <div>
          <Button
            type="submit"
            view="submit"
            disabled={
              disableSave ||
              !(this.state.hasChanges || this.state.hasChangesMatcher)
            }
            className="margin-main-big"
            onClick={this.onSaveNodeHandler}
          >
            {t('networksSettings.save')}
          </Button>
        </div>

        <div>
          {showSetDefaultBtn ? (
            <Button
              id="setDefault"
              type="button"
              disabled={
                disableSave ||
                (this.state.isDefault && this.state.isDefaultMatcher)
              }
              onClick={this.saveDefault}
            >
              {t('networksSettings.setDefault')}
            </Button>
          ) : null}
        </div>

        <Modal
          animation={Modal.ANIMATION.FLASH_SCALE}
          showModal={this.state.showCopied}
        >
          <div className="modal notification">
            {t('networksSettings.copied')}
          </div>
        </Modal>

        <Modal
          animation={Modal.ANIMATION.FLASH_SCALE}
          showModal={this.state.showSaved}
        >
          <div className="modal notification">
            {t('networksSettings.savedModal')}
          </div>
        </Modal>

        <Modal
          animation={Modal.ANIMATION.FLASH_SCALE}
          showModal={this.state.showSetDefault}
        >
          <div className="modal notification">
            {t('networksSettings.setDefaultModal')}
          </div>
        </Modal>
      </div>
    );
  }

  saveNode() {
    const { node, isDefault, hasChanges } = this.state;

    if (isDefault) {
      this.setDefaultNode();
      return null;
    }

    if (hasChanges) {
      this.props.setCustomNode({ node, network: this.props.currentNetwork });
    }
  }

  saveMatcher() {
    const { matcher, isDefaultMatcher, hasChangesMatcher } = this.state;

    if (isDefaultMatcher) {
      this.setDefaultMatcher();
      return null;
    }

    if (hasChangesMatcher) {
      this.props.setCustomMatcher({
        matcher,
        network: this.props.currentNetwork,
      });
    }
  }

  saveCode() {
    const { currentNetwork } = this.props;
    const { networkCode } = NETWORK_CONFIG[currentNetwork];

    if (!networkCode) {
      this.props.setCustomCode({
        code: this.state.newCode,
        network: currentNetwork,
      });
    }
  }

  setDefaultNode() {
    this.props.setCustomNode({
      node: null,
      network: this.props.currentNetwork,
    });
    this.setState({ node: this.state.defaultNode });
  }

  setDefaultMatcher() {
    this.props.setCustomMatcher({
      matcher: null,
      network: this.props.currentNetwork,
    });
    this.setState({ matcher: this.state.defaultMatcher });
  }

  onCopy() {
    if (this._tCopy != null) {
      clearTimeout(this._tCopy);
    }

    this.setState({ showCopied: true });
    this._tCopy = setTimeout(() => this.setState({ showCopied: false }), 1000);
  }

  onSave() {
    if (this._tSave != null) {
      clearTimeout(this._tSave);
    }

    this.setState({ showSaved: true });
    this._tSave = setTimeout(() => this.setState({ showSaved: false }), 1000);
  }

  onSaveDefault() {
    if (this._tSetDefault != null) {
      clearTimeout(this._tSetDefault);
    }

    this.setState({ showSetDefault: true });
    this._tSetDefault = setTimeout(
      () => this.setState({ showSetDefault: false }),
      1000
    );
  }
}

const mapToProps = (store: PopupState) => ({
  currentNetwork: store.currentNetwork,
  customNodes: store.customNodes,
  customMatcher: store.customMatcher,
});

export const NetworksSettings = connect(mapToProps, {
  setCustomNode,
  setCustomMatcher,
  setCustomCode,
})(withTranslation()(NetworksSettingsComponent));
