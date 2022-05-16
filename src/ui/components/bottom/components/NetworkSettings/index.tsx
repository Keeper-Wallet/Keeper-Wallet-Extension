import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import * as styles from './networkSettings.styl';
import { getMatcherPublicKey, getNetworkByte } from 'ui/utils/waves';
import { Button, Error, Input } from 'ui/components/ui';

const key = key => `bottom.${key}`;

class NetworkSettingsComponent extends React.PureComponent<
  INetworkSettings,
  IState
> {
  state = {} as IState;

  static getDerivedStateFromProps(
    props: INetworkSettings,
    state: IState
  ): IState {
    const { matcher, name, networkCode, node, onSave, onClose } = props;

    return {
      ...state,
      name,
      onSave,
      onClose,
      node: state.node == null ? node : state.node,
      matcher: state.matcher == null ? matcher : state.matcher,
      networkCode: state.networkCode == null ? networkCode : state.networkCode,
    };
  }

  render(): React.ReactNode {
    const { t } = this.props;
    const { name } = this.state;

    return (
      <div className="modal cover">
        <div id="customNetwork" className="modal-form">
          <div>
            <i className="networkIconActive"> </i>
            <h2 className="headline2 margin-main-big">
              <span className="capitalize">{t(key(name))}</span>{' '}
              {t('networkSettings.customNetwork')}
            </h2>
          </div>

          <div className={styles.dotsDivider} />

          <div>
            <div className="margin-main-big relative">
              <label
                className="input-title basic500 tag1"
                htmlFor="node_address"
              >
                {t('networksSettings.node')}
              </label>
              <Input
                id="node_address"
                value={this.state.node || ''}
                onChange={this.changeHandler('node', 'nodeError')}
              />
              <Error show={this.state.nodeError}>
                {this.state.node
                  ? t('networkSettings.nodeError')
                  : t('networkSettings.nodeUrlEmpty')}
              </Error>
            </div>

            <div className="margin-main-big relative">
              <label
                className="input-title basic500 tag1"
                htmlFor="matcher_address"
              >
                {t('networksSettings.matcher')}
              </label>
              <Input
                id="matcher_address"
                value={this.state.matcher || ''}
                onChange={this.changeHandler('matcher', 'matcherError')}
              />
              <Error show={this.state.matcherError}>
                {t('networkSettings.matcherError')}
              </Error>
            </div>
          </div>

          <div>
            <Button
              id="networkSettingsSave"
              type="submit"
              view="submit"
              onClick={this.saveHandler}
              className="margin-main-big relative"
            >
              {t('networkSettings.saveAndApply')}
            </Button>

            <div className="center">
              <Button
                onClick={this.state.onClose}
                type="button"
                view="transparent"
              >
                {t('networkSettings.cancel')}
              </Button>
            </div>

            <Button
              className="modal-close"
              onClick={this.state.onClose}
              type="button"
              view="transparent"
            />
          </div>
        </div>
      </div>
    );
  }

  private changeHandler = (valueName, errorName) => event => {
    const { target } = event;
    this.setState({ [valueName]: target.value, [errorName]: false } as any);
  };

  private saveHandler = () => {
    this.setState({ validating: true });
    const nodeValidator = this.validateNode();
    const matcherValidator = this.validateMatcher();

    Promise.all([nodeValidator, matcherValidator])
      .then(() => this.saveData())
      .catch(() => {});
  };

  private saveData() {
    const { matcherError, nodeError } = this.state;

    if (matcherError || nodeError) {
      return;
    }

    const { node, name, matcher, networkCode: code } = this.state;

    this.props.onSave({
      name,
      node,
      matcher,
      code,
    });
  }

  private validateNode() {
    const { node } = this.state;

    return getNetworkByte(node)
      .then(networkCode => this.setState({ nodeError: false, networkCode }))
      .catch(() => {
        this.setState({ nodeError: true });
        return Promise.reject();
      });
  }

  private validateMatcher() {
    const { matcher } = this.state;

    if (!matcher) {
      this.setState({ matcherError: false });
      return null;
    }

    return getMatcherPublicKey(matcher)
      .then(() => this.setState({ matcherError: false }))
      .catch(() => {
        this.setState({ matcherError: true });
        return Promise.reject();
      });
  }
}

interface INetworkSettings extends WithTranslation {
  name: string;
  networkCode: string;
  node: string;
  matcher: string;
  onSave: (netConfig: INetworkData) => any;
  onClose: () => any;
}

interface INetworkData {
  name: string;
  code: string;
  node: string;
  matcher: string;
}

interface IState extends INetworkSettings {
  nodeError: boolean;
  matcherError: boolean;
  validating: boolean;
  filledData: boolean;
}

export const NetworkSettings = withTranslation()(NetworkSettingsComponent);
