import * as styles from './permissionsSettings.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { allowOrigin, deleteOrigin, disableOrigin, setAutoOrigin, setShowNotification } from 'ui/actions';
import cn from 'classnames';
import { I18N_NAME_SPACE } from 'ui/appConfig';
import { Loader, Modal } from 'ui/components/ui';
import { Tabs, List, OriginSettings } from './components';


@translate(I18N_NAME_SPACE)
class PermissionsSettingsComponent extends React.PureComponent {
    
    readonly state = { originsList: 'customList', origin: null, permissions: [], autoSign: null };
    readonly props;
    
    deleteHandler = (origin) => {
        this.props.deleteOrigin(origin);
        this.closeSettingsHandler();
    };
    
    showSettingsHandler = (origin: string) => {
        const [_, permissions] = Object.entries(this.props.origins).find(([name]) => name === origin);
        const autoSign = (permissions as [] || []).find(({ type }) => type === 'allowAutoSign') || Object.create(null);
        autoSign.totalAmount = autoSign.totalAmount / 10 ** 8 || 0;
        this.setState({ origin, autoSign ,permissions });
    };
    
    toggleApproveHandler = (origin: string, enable: boolean) => {
        if (enable) {
            this.props.allowOrigin(origin);
        } else {
            this.props.disableOrigin(origin);
        }
    };
    
    onChangeOriginSettings = (autoSign) => {
        this.setState({ autoSign });
    };
    
    saveSettingsHandler = (params, origin, canShowNotifications) => {
        this.props.setAutoOrigin({ origin, params });
        this.props.setShowNotification({ origin, canUse: canShowNotifications });
        this.closeSettingsHandler();
    };
    
    closeSettingsHandler = () => {
        this.setState({ origin: null, permissions: [] });
    };
    
    render() {
        const tabs = ['customList', 'whiteList'].map(name => (
            {
                item: <Trans key={name} i18nKey={`permission.${name}`}>{name}</Trans>,
                name
            }
        ));
        const className = cn(styles.content);
        
        const {
            pending,
            allowed,
            disallowed,
            deleted
        } = this.props;
        
        return <div className={className}>
            <h2 className="title1 center margin-main-big">
                <Trans i18nKey='permissionsSettings.title'>Permissions control</Trans>
            </h2>
            
            <Loader hide={!pending}/>
            
            <Tabs tabs={tabs}
                  currentTab={this.state.originsList}
                  onSelectTab={originsList => this.setState({ originsList })}/>
            
            <List origins={this.props.origins}
                  showType={this.state.originsList as any}
                  showSettings={this.showSettingsHandler}
                  toggleApprove={this.toggleApproveHandler}
            />
            
            <Modal showModal={this.state.origin}>
                <div className={styles.cover}>
                    <OriginSettings originName={this.state.origin}
                                    permissions={this.state.permissions}
                                    autoSign={this.state.autoSign}
                                    onSave={this.saveSettingsHandler}
                                    onChangePerms={this.onChangeOriginSettings}
                                    onClose={this.closeSettingsHandler}
                                    onDelete={this.deleteHandler}/>
                </div>
            </Modal>
            
            <Modal animation={Modal.ANIMATION.FLASH_SCALE}
                   showModal={allowed || disallowed || deleted}
                   showChildrenOnly={true}>
                <div className='modal notification'>
                    {allowed ? <Trans i18nKey='permissionsSettings.notify.allowed'>Allowed!</Trans> : null}
                    {disallowed ? <Trans i18nKey='permissionsSettings.notify.disallowed'>Disallowed!</Trans> : null}
                    {deleted ? <Trans i18nKey='permissionsSettings.notify.deleted'>Deleted!</Trans> : null}
                </div>
            </Modal>
        </div>
    }
}

const mapStateToProps = function (store) {
    return {
        origins: store.origins,
        ...store.permissions,
    };
};

const actions = {
    allowOrigin,
    deleteOrigin,
    disableOrigin,
    setAutoOrigin,
    setShowNotification,
};

export const PermissionsSettings = connect(mapStateToProps, actions)(PermissionsSettingsComponent);
