import * as React from 'react';
import * as styles from './head.styl';
import { translate, Trans } from 'react-i18next';

@translate('ui')
export class BigLogo extends React.PureComponent {

    readonly props: IProps;

    constructor(params) {
        super(params);
    }

    render() {
        return <div className={`${styles.bigLogo} center ${this.props.className || ''}`}>
            <div className={styles.bigLogoImg}></div>
            <div className={styles.bigLogoTitle}>
                <Trans i18nKey='logo-title'>your keys manager</Trans>
            </div>
        </div>
    }
}

interface IProps {
    className?: string;
}
