import * as styles from './styles/intro.styl';
import * as React from 'react'
import {BigLogo} from '../head';
import {Loader} from '../ui';
import {translate, Trans} from 'react-i18next';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
export class Intro extends React.Component {

    render() {
        return <div className={styles.intro}>
            <BigLogo/>
            <div className={styles.loader}></div>
        </div>
    }
}
