import * as styles from './styles/intro.styl';
import * as React from 'react'
import { BigLogo } from '../head';
import { Loader } from '../ui';
import { translate, Trans } from 'react-i18next';

class IntroComponent extends React.Component {

    render() {
        return <div className={styles.intro}>
            <BigLogo/>
            <div className={styles.loader}>
                <Loader/>
            </div>
        </div>
    }
}



export const Intro = translate('intro')(IntroComponent);
