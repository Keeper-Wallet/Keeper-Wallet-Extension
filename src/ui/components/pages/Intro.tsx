import * as styles from './styles/intro.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';


class IntroComponent extends React.Component {

    props: IProps;
    state: IComponentState;
    setState: (state: IComponentState) => void;

    constructor(props = {} as IProps) {
        super(props);

        const { locked, hasAccount } = props;

        this.state = {
            locked,
            hasAccount
        };
    }

    render () {

        const locked = this.props.locked;
        const hasAccount = this.props.hasAccount;

        console.log(this.props, "<---render")

        if (locked == null && hasAccount == null) {
            return <div className={styles.intro}>
                <Trans>
                    Intro page
                    <div>{this.props.hasAccount}</div>
                    <div>{this.props.locked}</div>
                    <div>{window.location.href}</div>
                </Trans>
            </div>
        }

        if (!hasAccount) {
            return <Redirect to='/conditions'/>
        }

        if (hasAccount && locked) {
            return <Redirect to='/login'/>;
        }

        if (hasAccount && !locked) {
            return <Redirect to='/login'/>; //TODO app
        }
    }
}

const mapStateToProps = function (store: any) {
    console.log('update intro store');
    return {
        locked: store.state.locked,
        hasAccount: store.state.hasAccount,
    };
};

export const Intro = connect(mapStateToProps)(translate('intro')(IntroComponent));

interface IComponentState {
    locked: boolean;
    hasAccount: boolean;
}

interface IProps extends IComponentState {
}
