import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './networkSettings.styl';
import { getMatcherPublicKey, getNetworkByte } from 'ui/utils/waves';
import { Button, BUTTON_TYPE, Error, Input } from 'ui/components/ui';

const key = (key) => `bottom.${key}`;

export class NetworkSettings extends React.PureComponent<INetworkSettings, IState> {
    state = {} as IState;

    static getDerivedStateFromProps(props: INetworkSettings, state: IState): IState {
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
        const { name } = this.state;

        return (
            <div className={styles.networkSettings}>
                <div className={styles.contentBox}>
                    <div>
                        <i className="networkIconActive"></i>
                        <h2 className="headline2 margin-main-big">
                            <span className="capitalize">
                                <Trans i18nKey={key(name)}>{name}</Trans>
                            </span>{' '}
                            <Trans i18nKey="networkSettings.customNetwork">network</Trans>
                        </h2>
                    </div>

                    <div className={styles.dotsDivider} />

                    <div>
                        <div className="margin-main-big relative">
                            <label className="input-title basic500 tag1" htmlFor="node_address">
                                <Trans i18nKey="networksSettings.node">Node address</Trans>
                            </label>
                            <Input
                                id="node_address"
                                value={this.state.node || ''}
                                onChange={this.changeHandler('node', 'nodeError')}
                            />
                            <Error show={this.state.nodeError}>
                                {this.state.node ? (
                                    <Trans i18nKey="networkSettings.nodeError">Incorrect node address</Trans>
                                ) : (
                                    <Trans i18nKey="networkSettings.nodeUrlEmpty">URL is required</Trans>
                                )}
                            </Error>
                        </div>

                        <div className="margin-main-big relative">
                            <label className="input-title basic500 tag1" htmlFor="matcher_address">
                                <Trans i18nKey="networksSettings.matcher">Matcher address</Trans>
                            </label>
                            <Input
                                id="matcher_address"
                                value={this.state.matcher || ''}
                                onChange={this.changeHandler('matcher', 'matcherError')}
                            />
                            <Error show={this.state.matcherError}>
                                <Trans i18nKey="networkSettings.matcherError">Incorrect matcher address</Trans>
                            </Error>
                        </div>
                    </div>

                    <div>
                        <Button
                            type={BUTTON_TYPE.GENERAL}
                            onClick={this.saveHandler}
                            className="margin-main-big relative"
                        >
                            <Trans i18nKey="networkSettings.saveAndApply">Save and apply</Trans>
                        </Button>
                        <div className="center">
                            <Button onClick={this.state.onClose} type="transparent">
                                <Trans i18nKey="networkSettings.cancel">Cancel</Trans>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private changeHandler = (valueName, errorName) => (event) => {
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
            .then((networkCode) => this.setState({ nodeError: false, networkCode }))
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

interface INetworkSettings {
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
