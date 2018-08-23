import * as styles from './styles/conditions.styl';
import * as React from 'react'

export class Conditions extends React.Component {

    render () {
        return <div className={styles.conditions}>
            Conditions
            <textarea>
                Some texts
                Some texts
                Some texts
                Some texts
                Some texts
                Some texts
            </textarea>
            <button>Accept</button>
        </div>
    }
}
