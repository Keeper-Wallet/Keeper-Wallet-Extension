import * as React from 'react';
import {connect} from 'react-redux';
import { setCustomNode, setCustomMatcher } from '../../actions';
import {Trans, translate} from 'react-i18next';
import { Button, BUTTON_TYPE, Copy, Input, Modal } from '../ui';
import * as styles from './styles/settings.styl';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
class NetworksSettingsComponent extends React.PureComponent {
    readonly props;
    readonly state;
    _t;

    onInputHandler = (event) => this.setState({ node: event.target.value });
    onInputMatcherHandler = (event) => this.setState({ matcher: event.target.value });
    onSaveNodeHandler = () => {
        this.saveNode();
        this.saveMatcher();
    };
    onSaveMatcherHandler = () => this.saveMatcher();
    saveDefault = () => {
        this.setDefaultNode();
        this.setDefaultMatcher();
    };
    
    copyHandler = () => this.onCopy();

    render() {
        return <div className={styles.networkTab}>
            <h2 className="title1 margin-main-big">
                <Trans i18nKey='networksSettings.network'>Network</Trans>
            </h2>

            <div className="margin-main-big relative">
                <label className="input-title basic500 tag1" htmlFor='node_address'>
                    <Copy text={this.state.node} onCopy={this.copyHandler}>
                        <div className={`copy-icon ${styles.copyIcon}`}></div>
                    </Copy>
                    <Trans i18nKey='networksSettings.node'>Node address</Trans>
                </label>
                <Input id='node_address' value={this.state.node} onChange={this.onInputHandler}/>
            </div>
    
            <div className="margin-main-big relative">
                <label className="input-title basic500 tag1" htmlFor='matcher_address'>
                    <Copy text={this.state.matcher} onCopy={this.copyHandler}>
                        <div className={`copy-icon ${styles.copyIcon}`}></div>
                    </Copy>
                    <Trans i18nKey='networksSettings.matcher'>Matcher address</Trans>
                </label>
                <Input id='matcher_address' value={this.state.matcher} onChange={this.onInputMatcherHandler}/>
            </div>

            <div>
                <Button type={BUTTON_TYPE.SUBMIT}
                        disabled={!(this.state.hasChanges || this.state.hasChangesMatcher)}
                        className="margin-main-big"
                        onClick={this.onSaveNodeHandler}>
                    <Trans i18nKey='networksSettings.save'>Save</Trans>
                </Button>
            </div>

            <div>
                <Button disabled={this.state.isDefault && this.state.isDefaultMatcher}
                        onClick={this.saveDefault}>
                    <Trans i18nKey='networksSettings.setDefault'>Set Default</Trans>
                </Button>
            </div>

            <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={this.state.showCopied} showChildrenOnly={true}>
                <div className="modal notification">
                    <Trans i18nKey="networksSettings.copied">Copied!</Trans>
                </div>
            </Modal>
        </div>;
    }

    saveNode() {
        const { node, isDefault, hasChanges } = this.state;

        if (isDefault) {
            this.setDefaultNode();
            return null;
        }
        
        if (hasChanges) {
            this.props.setCustomNode(node);
        }
    }
    
    saveMatcher() {
        const { matcher, isDefaultMatcher, hasChangesMatcher } = this.state;
        
        if (isDefaultMatcher) {
            this.setDefaultMatcher();
            return null;
        }
        
        if (hasChangesMatcher) {
            this.props.setCustomMatcher(matcher);
        }
    }

    setDefaultNode() {
        this.props.setCustomNode(null);
        this.setState({ node: this.state.defaultNode });
    }
    
    setDefaultMatcher() {
        this.props.setCustomMatcher(null);
        this.setState({ matcher: this.state.defaultMatcher });
    }
    
    onCopy() {
        clearTimeout(this._t);
        this.setState({ showCopied: true });
        this._t = setTimeout(() => this.setState({ showCopied: false }), 1000);
    }

    static getDerivedStateFromProps(props, state) {
        state = { ...state };

        const defaultServers = props.networks.find(item => item.name === props.currentNetwork);
        
        const defaultNode = defaultServers.server;
        const currentNode = props.customNodes[props.currentNetwork];
        const isDefault = state.node === defaultNode;
        const isCurrent = currentNode && state.node === currentNode;
        const hasChanges = state.node && ((isDefault && currentNode) || (!isCurrent && !isDefault) );
        const node = hasChanges || state.node != null ? state.node : currentNode || defaultNode;
        const defaultMatcher = defaultServers.matcher;
        const currentMatcher = props.customMatcher[props.currentNetwork];
        const isDefaultMatcher = state.matcher === defaultMatcher;
        const isCurrentMatcher = currentMatcher && state.matcher === currentMatcher;
        const hasChangesMatcher = state.matcher && ((isDefaultMatcher && currentMatcher) || (!isCurrentMatcher && !isDefaultMatcher) );
        const matcher = hasChangesMatcher || state.matcher != null ? state.matcher : currentMatcher || defaultMatcher;
        
        return {
            node, defaultNode, currentNode, hasChanges, isDefault, isCurrent,
            matcher, defaultMatcher, currentMatcher, hasChangesMatcher, isDefaultMatcher, isCurrentMatcher
        };
    }
}


const mapToProps = (store) => {
    return {
        networks: store.networks,
        currentNetwork: store.currentNetwork,
        customNodes: store.customNodes,
        customMatcher: store.customMatcher,
    };
};

const actions = {
    setCustomNode,
    setCustomMatcher
};

export const NetworksSettings = connect(mapToProps, actions)(NetworksSettingsComponent);
