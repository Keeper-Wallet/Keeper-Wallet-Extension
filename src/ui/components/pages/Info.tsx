import * as React from 'react';
import { Trans, translate } from 'react-i18next';
import { BigLogo } from '../head';

@translate('extension')
export class Info extends React.Component {

    render () {
        const props = this.props;

        return <div>
            <BigLogo noTitle={true}/>
            <Trans i18nKey='info.keepUp'>
                Keep up with the latest news and
                articles, and find out all about events
                happening on the Waves Platform</Trans>
            <a href='wavescommunity.com'>wavescommunity.com</a>
            <div>
                <Trans i18nKey='info.joinUs'>Join the Waves Community</Trans>
            </div>
            <div>links</div>
            <div>© Waves Platform</div>
        </div>;
    }
};
