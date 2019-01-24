import * as React from 'react';
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { updateActiveMessage, getAsset, approve, reject, clearMessages } from '../../actions';
import { Intro } from './Intro';
import { getConfigByTransaction } from '../transactions';
import { I18N_NAME_SPACE } from '../../appConfig';


const Messages = ({ messages, assets, onSelect }) => {
    return messages.map((message) => {
        const config = getConfigByTransaction(message);
        const Card = config.card;
        return <div key={message.id} onClick={() => onSelect(message)}>
            <Card message={message} assets={assets} collapsed={true}/>
        </div>;
    });
};

@translate(I18N_NAME_SPACE)
class MessageListComponent extends React.Component {
    
    readonly state = { loading: true };
    readonly props;
   
    readonly selectHandler = (message) => {
        this.props.updateActiveMessage(message);
    };
    
    render() {
        if (this.state.loading) {
            return <Intro/>
        }
        
        const { messages, assets } = this.props;
        
        return <div>
            <div >
                {messages.length} <Trans i18nKey='messageList.pendingConfirm'>Pending confirmation</Trans>
            </div>
            <Messages messages={messages} assets={assets} onSelect={this.selectHandler}/>
        </div>;
    }
    
    static getDerivedStateFromProps(props, state) {
        const { messages, assets } = props;
        const needAssets = MessageListComponent.getAssets(messages, assets);
        needAssets.forEach( id => props.getAsset(id));
        
        if (needAssets.length > 0) {
            return { loading: true };
        }
        
        return { messages, assets, loading: false };
    }
    
    static getAssets(messages = [], assetsHash) {
         const assets = messages.reduce(
             (acc, message) => {
                 const { data } = message;
                 const txData = data.data ? data.data : data;
                 const tx = { type: data.type, ...txData };
                 const config = getConfigByTransaction(message);
                 const assetIds = config.getAssetsId(tx);
                 assetIds.forEach(item => {
                     if (!assetsHash[item]) {
                         acc[item] = null
                     }
                 });
                 return acc;
             },
             Object.create(null));
         
         return Object.keys(assets);
    }
}

const mapStateToProps = function (store) {
    return {
        balance: store.balances[store.selectedAccount.address],
        selectedAccount: store.selectedAccount,
        assets: store.assets,
        messages: store.messages,
        hasNewMessages: store.messages.length > 0,
    };
};

const actions = {
    updateActiveMessage,
    clearMessages,
    getAsset,
    approve,
    reject
};

export const MessageList = connect(mapStateToProps, actions)(MessageListComponent);
