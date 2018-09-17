import * as React from 'react';
import * as styles from './head.styl';
import { Trans } from 'react-i18next';
import cn from 'classnames';

export const BigLogo = ({ className='', noTitle=false }) => {

    className = cn(styles.bigLogo, className, 'center');

    return <div className={className}>
        <div className={styles.bigLogoImg}></div>
        {
            noTitle ? null : <div className={styles.bigLogoTitle}>
                    <Trans i18nKey='ui.logo-title'>your keys manager</Trans>
                </div>
        }
    </div>
}
