import * as React from 'react';
import {connect} from 'react-redux';
import { setCustomNode } from '../../actions';
import {Trans, translate} from 'react-i18next';
import { Button, BUTTON_TYPE, Copy, Input } from '../ui';


@translate('extension')
class NetworksSettingsComponent extends React.PureComponent {
    readonly props;
    readonly state;

    onInputHandler = (event) => this.setState({ node: event.target.value });
    onSaveNodeHandler = () => this.saveNode();
    onSetDefaultNodeHandler = () => this.setDefaultNode();

    render() {
        return <div>
            <h1>
                <Trans i18nKey='networksSettings.network'>Network</Trans>
            </h1>

            <div>
                <label htmlFor='node_address'>
                    <Copy text={this.state.node}>
                        <div className='copy-icon'></div>
                    </Copy>
                    <Trans i18nKey='networksSettings.node'>Node address</Trans>
                </label>
                <Input id='node_address' value={this.state.node} onChange={this.onInputHandler}/>

            </div>

            <div>
                <Button type={BUTTON_TYPE.SUBMIT}
                        disabled={!this.state.hasChanges}
                        onClick={this.onSaveNodeHandler}>
                    <Trans i18nKey='networksSettings.save'>Save</Trans>
                </Button>
            </div>

            <div>
                <Button disabled={this.state.isDefault}
                        onClick={this.onSetDefaultNodeHandler}>
                    <Trans i18nKey='networksSettings.setDefault'>Set Default</Trans>
                </Button>
            </div>
        </div>;
    }

    saveNode() {
        const { node, isDefault } = this.state;

        if (isDefault) {
            this.setDefaultNode();
            return null;
        }
        
        this.props.setCustomNode(node);
    }

    setDefaultNode() {
        this.props.setCustomNode(null);
        this.setState({ node: this.state.defaultNode });
    }

    static getDerivedStateFromProps(props, state) {
        state = { ...state };

        const defaultNode = props.networks.find(item => item.name === props.currentNetwork).server;
        const currentNode = props.customNodes[props.currentNetwork];
        const isDefault = state.node === defaultNode;
        const isCurrent = currentNode && state.node === currentNode;
        const hasChanges = state.node && ((isDefault && currentNode) || (!isCurrent && !isDefault) );
        const node = hasChanges || state.node != null ? state.node : currentNode || defaultNode;
        return { node, defaultNode, currentNode, hasChanges, isDefault, isCurrent };
    }
}


const mapToProps = (store) => {
    return {
        networks: store.networks,
        currentNetwork: store.currentNetwork,
        customNodes: store.customNodes,
    };
};

const actions = {
    setCustomNode,
};

export const NetworksSettings = connect(mapToProps, actions)(NetworksSettingsComponent);
