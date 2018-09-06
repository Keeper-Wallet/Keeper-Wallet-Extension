import * as styles from './styles/login.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { setTab } from '../../actions';

import { BigLogo } from '../head';
import { Button } from '../ui/buttons';

@translate('import')
class ImportComponent extends React.PureComponent {

    props: any;

    render () {
        return <div className={styles.login}>
            <div className={`content`}>
                <BigLogo className={`logoMargin`} />
                <div className={`margin4`}>
                    <form onSubmit={this.onClick.bind(this, 'new_account')}>
                        <Button type='submit'>
                            <Trans i18nKey='createNew'>Create a new account</Trans>
                        </Button>
                    </form>
                </div>
                <div>
                    <Button type='transparent' onClick={this.onClick.bind(this, 'import_seed')}>
                        <div>
                            <Trans i18nKey='importAccount'>Import Account</Trans>
                        </div>
                        <div>
                            <Trans i18nKey='viaSeed'>Via SEED or Encoded</Trans>
                        </div>
                    </Button>
                </div>
                <div>
                    <Button type='transparent' onClick={this.onClick.bind(this, 'import_device')}>
                        <div>
                            <Trans i18nKey='useHardware'>Use secure hardware</Trans>
                        </div>
                        <div>
                            <Trans i18nKey='viaDevices'>Via Ledger</Trans>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    }

    onClick(tab) {
        this.props.setTab(tab);
    }
}

const actions = {
    setTab
};


const mapStateToProps = function() {
    return {};
};

export const Import = connect(mapStateToProps, actions)(ImportComponent);
