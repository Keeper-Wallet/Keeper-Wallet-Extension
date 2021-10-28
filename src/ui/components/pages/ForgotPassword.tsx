import * as styles from './styles/forgotAccount.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { Trans, withTranslation } from 'react-i18next';
import { Button, Error, Input } from '../ui';
import { deleteAccount } from '../../actions';
import cn from 'classnames';

class ForgotPasswordComponent extends React.Component {
    state = { phrase: null, isBlur: false };
    props;
    defaultPhrase: string;
    phraseEl;

    confirmPhraseRef = (el) => {
        this.phraseEl = el;
    };

    constructor(props) {
        super(props);
        this.defaultPhrase = props.t('forgotPassword.phrase');
    }

    componentDidMount() {
        this.phraseEl.focus();
    }

    render() {
        const isCorrectLength = this.state.phrase?.length >= this.defaultPhrase.length;
        const hasError = this.state.phrase !== this.defaultPhrase;

        return (
            <div className={styles.content}>
                <i className={`error-icon ${styles.errorIcon}`} />

                <h2 className="title1 margin1">
                    <Trans i18nKey="forgotPassword.attention" />
                </h2>

                <div className="body1 margin1">
                    <Trans i18nKey="forgotPassword.attentionMessage" />
                </div>

                <div className={cn('plate', 'body1', 'margin1', styles.error)}>
                    <Trans i18nKey="forgotPassword.warningMessage" />
                </div>
                <div className="margin1 margin-main-big-top">
                    <Trans i18nKey="forgotPassword.continueMessage" />
                </div>

                <div id="defaultPhrase" className="plate center margin1 cant-select">
                    <Trans i18nKey="forgotPassword.phrase" />
                </div>
                <div>
                    <Input
                        id="confirmPhrase"
                        ref={this.confirmPhraseRef}
                        type="input"
                        className="margin1"
                        placeholder="Type here..."
                        onInput={(event) => this.setState({ phrase: event.target.value, isBlur: false })}
                        onBlur={() => this.setState({ isBlur: true })}
                    />
                    <Error
                        className={cn('margin1', styles.error)}
                        show={hasError && (this.state.isBlur || isCorrectLength)}
                    >
                        <Trans i18nKey="forgotPassword.phraseError" />
                    </Error>
                </div>

                <div className="buttons-wrapper">
                    <Button id="resetCancel" onClick={() => this.props.onBack()}>
                        <Trans i18nKey="forgotPassword.resetCancel" />
                    </Button>
                    <Button
                        id="resetConfirm"
                        type="warning"
                        disabled={hasError}
                        onClick={() => this.props.deleteAccount()}
                    >
                        <Trans i18nKey="forgotPassword.resetConfirm" />
                    </Button>
                </div>
            </div>
        );
    }
}

const actions = {
    deleteAccount,
};

const mapStateToProps = function () {
    return {};
};

export const ForgotPassword = connect(mapStateToProps, actions)(withTranslation()(ForgotPasswordComponent));
