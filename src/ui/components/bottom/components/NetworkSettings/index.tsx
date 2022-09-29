import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import * as styles from './networkSettings.styl';
import { getMatcherPublicKey, getNetworkByte } from 'ui/utils/waves';
import { Button, ErrorMessage, Input } from 'ui/components/ui';
import { NetworkName } from 'networks/types';

const key = (key: string | null | undefined) => `bottom.${key}`;

interface Props extends WithTranslation {
  name: NetworkName | null;
  networkCode: string | null;
  node: string | null;
  matcher: string | null;
  onSave: (netConfig: INetworkData) => void;
  onClose: () => void;
}

export interface INetworkData {
  name: NetworkName | null | undefined;
  code: string | null | undefined;
  node: string | null | undefined;
  matcher: string | null | undefined;
}

interface State extends Partial<Props> {
  nodeError?: boolean;
  matcherError?: boolean;
  validating?: boolean;
  filledData?: boolean;
}

class NetworkSettingsComponent extends React.PureComponent<Props, State> {
  state: State = {};

  static getDerivedStateFromProps(
    props: Readonly<Props>,
    state: State
  ): Partial<State> | null {
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

  render() {
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
              <ErrorMessage
                show={this.state.nodeError}
                data-testid="nodeAddressError"
              >
                {this.state.node
                  ? t('networkSettings.nodeError')
                  : t('networkSettings.nodeUrlEmpty')}
              </ErrorMessage>
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
              <ErrorMessage show={this.state.matcherError}>
                {t('networkSettings.matcherError')}
              </ErrorMessage>
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

  private changeHandler =
    (valueName: 'matcher' | 'node', errorName: 'matcherError' | 'nodeError') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { target } = event;
      this.setState({
        [valueName]: target.value,
        [errorName]: false,
      });
    };

  private saveHandler = () => {
    this.setState({ validating: true });
    const nodeValidator = this.validateNode();
    const matcherValidator = this.validateMatcher();

    Promise.all([nodeValidator, matcherValidator])
      .then(() => this.saveData())
      .catch(() => {
        // ignore errors
      });
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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return getNetworkByte(node!)
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

export const NetworkSettings = withTranslation()(NetworkSettingsComponent);
