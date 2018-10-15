import * as styles from './styles/import.styl';
import * as React from 'react'
import {connect} from 'react-redux';
import {translate, Trans} from 'react-i18next';
import {BigLogo} from '../head';
import {Button} from '../ui/buttons';

@translate('extension')
class ImportComponent extends React.PureComponent {

    props: any;

    render() {
        return <div className={styles.import}>
            <div className={styles.content}>
                <div className={styles.topMargin}>
                    <div className={`import-icon ${styles.importIcon}`}></div>
                    <form onSubmit={this.onClick.bind(this, 'new_account')}>
                        <Button type='submit'>
                            <Trans i18nKey='import.createNew'>Create a new account</Trans>
                        </Button>
                    </form>
                </div>
                <div>
                    <div className={`left border-bottom ${styles.importChooser}`}>
                        <Button className="fullwidth" type='transparent' onClick={this.onClick.bind(this, 'import_seed')}>
                            <div className='body1'>
                                <Trans i18nKey='import.importAccount'>Import Account</Trans>
                            </div>
                            <div className='body3 disabled500 font300'>
                                <Trans i18nKey='import.viaSeed'>Via SEED</Trans>
                            </div>
                        </Button>
                    </div>
                    {/*<div className={`left ${styles.importChooser}`}>*/}
                        {/*<Button type='transparent' onClick={this.onClick.bind(this, 'import_device')}>*/}
                            {/*<div className='body1'>*/}
                                {/*<Trans i18nKey='import.useHardware'>Use secure hardware</Trans>*/}
                            {/*</div>*/}
                            {/*<div className='body3 disabled500 font300'>*/}
                                {/*<Trans i18nKey='import.viaDevices'>Via Ledger</Trans>*/}
                            {/*</div>*/}
                        {/*</Button>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    }

    onClick(tab) {
        this.props.setTab(tab);
    }
}

const actions = {};

const mapStateToProps = function () {
    return {};
};

export const Import = connect(mapStateToProps, actions)(ImportComponent);
