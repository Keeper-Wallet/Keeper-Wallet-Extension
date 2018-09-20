import * as React from 'react';
import {connect} from 'react-redux';
import {Trans, translate} from 'react-i18next';
import { Button, Input } from '../ui';


@translate()
class ChangeAccountNameComponent extends React.PureComponent {
    readonly props;
    readonly state = { newName: '' };

    setNewName = event => this.setState({ newName: event.target.value });
    submitHandler = event => this.setState({ newName: event.target.value });

    render() {
        return <div>
            <h1>
                <Trans i18nKey='changeName.title'>Change name</Trans>
            </h1>

            <div>
                <Trans i18nKey='changeName.currentName'>Current account name</Trans>
            </div>
            <div>{this.props.selectedAccount.name}</div>

            <form onSubmit={this.submitHandler}>
                <div>
                    <Trans i18nKey='changeName.newName'>New account name</Trans>
                </div>
                <div>
                    <Input onChange={this.setNewName} value={this.state.newName} maxlength='32'/>
                </div>
                <Button type='submit'>
                    <Trans i18nKey='changeName.save'>Save</Trans>
                </Button>
            </form>
        </div>;
    }
}


const mapToProps = ({ selectedAccount }) => ({ selectedAccount });

export const ChangeAccountName = connect()(ChangeAccountNameComponent);
