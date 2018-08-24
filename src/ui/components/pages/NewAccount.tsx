import * as styles from './styles/newaccount.styl';
import * as React from 'react'
import { HeadLogo } from '../head';


export class NewAccount extends React.Component {

    render () {
        return <div className={styles.account}>
            <HeadLogo/>
            <div className={styles.content}>
                <h2>Protect Your Account</h2>
            </div>
        </div>
    }
}
