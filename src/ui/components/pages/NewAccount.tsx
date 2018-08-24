import * as styles from './styles/newaccount.styl';
import * as React from 'react'
import {HeadLogo} from '../head';
import {Input, Button} from '../ui';


export class NewAccount extends React.Component {

    inputEl: Input;
    state = {
        firstValue: '',
        secondValue: '',
        firstError: null,
        secondError: null,
        buttonDisabled: true,
    };

    getRef = input => this.inputEl = input;
    onFirstBlur = () => this._onFirstBlur();
    onSecondBlur = () => this._onSecondBlur();
    onChangeFist = e => this._onChangeFist(e);
    onChangeSecond = e => this._onChangeSecond(e);

    componentDidMount(){
        this.inputEl.focus();
    }

    render() {
        return <div className={styles.account}>
                <HeadLogo/>
                <div className={styles.content}>
                    <h2>Protect Your Account</h2>

                    <div>
                        <Input id='first'
                               type="password"
                               ref={this.getRef}
                               onBlur={this.onFirstBlur}
                               onChange={this.onChangeFist}
                               error={!!this.state.firstError}
                        />
                        <Input id='second'
                               type="password"
                               onBlur={this.onSecondBlur}
                               onChange={this.onChangeSecond}
                               error={!!this.state.secondError}
                        />
                    </div>
                    <Button submit={true} disabled={this.state.buttonDisabled}>Create</Button>
                </div>
            </div>
    }

    _onFirstBlur () {
        this._checkValues();
    }

    _onSecondBlur() {
        this._checkValues();
    }

    _onChangeFist(e) {
        const firstValue = e.target.value;
        this.setState({ firstValue });
    }

    _onChangeSecond(e) {
        const secondValue = e.target.value;
        this.setState({ secondValue });
    }

    _checkValues() {
        const firstError = this._validateFirst();
        const secondError = this._validateSecond();
        const passwordError = !!(firstError || secondError);
        const buttonDisabled = passwordError || !(this.state.firstValue && this.state.secondValue);
        this.setState({ passwordError, firstError, secondError, buttonDisabled });
    }

    _validateFirst() {
        if (!this.state.firstValue) {
            return null;
        }

        if (this.state.firstValue.length <= 6) {
            return { error: 'isSmall' };
        }
    }

    _validateSecond() {
        if (!this.state.secondValue || !this.state.firstValue) {
            return null;
        }

        if (this.state.firstValue === this.state.secondValue) {
            return null;
        }

        return { error: 'noMatch' }
    }
}
