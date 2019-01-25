import * as React from 'react';
import { translate, Trans } from 'react-i18next';
import * as styles from './index.styl';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { getTransactionData } from './parseTx';


const MessageItem = ({ message, config, assets }) => {
    const Card = config.card;
    const Info = config.info;
    return <div>
        <Card message={message} assets={assets}/>
        <Info message={message} assets={assets}/>
    </div>;
};


@translate(I18N_NAME_SPACE)
export class PackageInfo extends React.PureComponent<IPackInfo> {
    
    render() {
        const { message, assets } = this.props;
        const { data = [] } = message;
        const txs = data.map(getTransactionData);
        const hashes = message.messageHash;
        return <div>
            {
                txs.map(({ config, tx }, index) => {
                    const message = {
                        data: {...tx, data: tx },
                        messageHash: hashes[index],
                        type: 'transaction',
                    };
                    return <div key={`${index}${config.messageType}`}>
                        <MessageItem config={config} assets={assets} message={message}/>
                    </div>;
                })
            }
        </div>;
    }
}

interface IPackInfo {
    message: any;
    assets: any;
}
