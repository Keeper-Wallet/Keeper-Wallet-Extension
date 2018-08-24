import * as React from 'react';
import * as styles from './head.styl';
import { translate, Trans } from 'react-i18next';

class BigLogoComponent extends React.PureComponent {

    readonly props: IProps;

    constructor(params) {
        super(params);
    }

    render() {
        return <div className={`${styles.bigLogo} textCenter ${this.props.className || ''}`}>
            <div className={styles.bigLogoImg}></div>
            <div className={styles.bigLogoTitle}>
                <Trans i18nKey='logo-title'>
                    your keys manager
                </Trans>
            </div>
        </div>
    }
}

export const BigLogo = translate('ui')(BigLogoComponent);

interface IProps {
    className?: string;
}
