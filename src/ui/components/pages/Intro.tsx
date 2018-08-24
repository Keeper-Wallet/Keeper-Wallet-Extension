import * as styles from './styles/intro.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';


class IntroComponent extends React.Component {

    render() {

        return <div className={styles.intro}>
            <Trans i18nKey="title">Intro page</Trans>
        </div>
    }
}



export const Intro = translate('intro')(IntroComponent);
