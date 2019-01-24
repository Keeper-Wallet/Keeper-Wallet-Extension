import * as React from 'react';
import { translate, Trans } from 'react-i18next';
import * as styles from './unknown.styl';
import { I18N_NAME_SPACE } from '../../../appConfig';


@translate(I18N_NAME_SPACE)
export class UnknownInfo extends React.PureComponent<IOriginAuthInfo> {
    
    render() {
        return <div></div>;
    }
}

interface IOriginAuthInfo {
    message: any;
    assets: any;
}
