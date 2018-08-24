import * as styles from './styles/intro.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { BigLogo } from '../head';
import { Loader } from '../ui'

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
