import * as React from 'react';
import { translate, Trans } from 'react-i18next';
import * as styles from './networkSettings.styl';
import { getNetworkByte, getMatcherPublicKey } from 'ui/utils/waves';
import { I18N_NAME_SPACE } from 'ui/appConfig';
import { Input, Button, BUTTON_TYPE, Error } from 'ui/components/ui';

const key = (key) => `bottom.${key}`;

@translate(I18N_NAME_SPACE)
export class NetworkSettings extends React.PureComponent<INetworkSettings, IState> {
    
    state = {} as IState;
    
    render(): React.ReactNode {
        const { name } = this.state;
        
        return <div className={styles.networkSettings}>
            <div className={styles.contentBox}>
                <div>
                    <h2 className="title1 center margin-main-big"><Trans i18nKey={key(name)}>{name}</Trans> <Trans
                        i18nKey="networkSettings.title">Network</Trans></h2>
                </div>
                
                <div className={styles.dotsDivider}/>
                
                <div>
                    <div className="margin-main-big relative">
                        <label className="input-title basic500 tag1" htmlFor='node_address'>
                            <Trans i18nKey='networksSettings.node'>Node address</Trans>
                        </label>
                        <Input id='node_address' value={this.state.node || ''} onChange={this.changeHandler('node', 'nodeError')}/>
                        <Error show={this.state.nodeError}>
                            {
                                this.state.node ?
                                    <Trans i18nKey="networkSettings.nodeError">Incorrect node address</Trans> :
                                    <Trans i18nKey="networkSettings.nodeUrlEmpty">URL is required</Trans>
                            }
                        </Error>
                    </div>
                    
                    <div className="margin-main-big relative">
                        <label className="input-title basic500 tag1" htmlFor='matcher_address'>
                            <Trans i18nKey='networksSettings.matcher'>Matcher address</Trans>
                        </label>
                        <Input id='matcher_address' value={this.state.matcher || ''}
                               onChange={this.changeHandler('matcher', 'matcherError')}/>
                        <Error show={this.state.matcherError}>
                            <Trans i18nKey="networkSettings.matcherError">Incorrect matcher address</Trans>
                        </Error>
                    </div>
                
                </div>
                
                <div>
                    <Button type={BUTTON_TYPE.GENERAL} onClick={this.saveHandler}>
                        <Trans i18nKey="networkSettings.saveAndApply">Save and apply</Trans>
                    </Button>
                    <Button onClick={this.state.onClose}>
                        <Trans i18nKey="networkSettings.cancel">Cancel</Trans>
                    </Button>
                </div>
            </div>
        </div>;
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
    };
    
    private saveData() {
        const { matcherError, nodeError} = this.state;
        
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
    
        getNetworkByte(node)
            .then(networkCode => this.setState({ nodeError: false, networkCode }))
            .catch(() => this.setState({ nodeError: true }))
    }
    
    private validateMatcher() {
        const { matcher } = this.state;
    
        getMatcherPublicKey(matcher)
            .then(() => this.setState({ matcherError: false }))
            .catch(() => this.setState({ matcherError: true }))
    }
    
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
