import * as styles from './styles/permissionsSettings.styl';
import * as React from 'react'
import {connect} from 'react-redux';
import {translate, Trans} from 'react-i18next';
import {Button, BUTTON_TYPE} from '../ui/buttons';
import {allowOrigin, deleteOrigin, disableOrigin} from '../../actions';
import cn from 'classnames';
import {I18N_NAME_SPACE} from '../../appConfig';
import {Loader, Modal} from '../ui';


const OriginComponent = (params) => (
    <div className={`${params.className} ${styles.permissoinItem}`}>
        <div>{params.origin}</div>
        <div className={styles.statusColor}>{params.status}</div>
        <div>
            {params.buttonAction}
            {params.buttonDelete}
        </div>
    </div>
);

@translate(I18N_NAME_SPACE)
class PermissionsSettingsComponent extends React.PureComponent {

    readonly props;

    allowHandler = (origin) => {
        this.props.allowOrigin(origin);
    };

    disableHandler = (origin) => {
        this.props.disableOrigin(origin);
    };

    deleteHandler = (origin) => {
        this.props.deleteOrigin(origin);
    };

    render() {

        const className = cn(styles.content);
        const origins = Object.entries(this.props.origins);
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

            {origins.length ? null : <div className={styles.emptyBlock}>
                <div className={styles.icon}></div>
                <div className={`body3 margin-main-top basic500 center ${styles.emptyBlockDescription}`}>
                    <Trans i18nKey='permissionsSettings.empty'>Nothing Here...</Trans>
                </div>
            </div>}

            <div className={styles.permissoinList}>
                {origins.map(([origin = '', status = []]) => {

                    const buttonDisable = <Button type={BUTTON_TYPE.TRANSPARENT}
                                                 onClick={() => this.disableHandler(origin)}
                                                 className={`${styles.button} ${styles.disable}`}>
                    </Button>;

                    const buttonEnable = <Button type={BUTTON_TYPE.TRANSPARENT}
                                                 onClick={() => this.allowHandler(origin)}
                                                 className={`${styles.button} ${styles.enable}`}>
                    </Button>;

                    const buttonDelete = <Button type={BUTTON_TYPE.TRANSPARENT}
                                                 onClick={() => this.deleteHandler(origin)}
                                                 className={`${styles.button} ${styles.delete}`}>
                    </Button>;

                    const myStatus = status && status[0];

                    const className = cn({
                        [styles.approved]: myStatus === 'approved',
                        [styles.rejected]: myStatus === 'rejected',
                    });
                    const params = {
                        className,
                        key: origin + myStatus,
                        origin,
                        status: myStatus,
                        buttonAction: myStatus.includes('approved') ? buttonDisable : buttonEnable,
                        buttonDelete,
                    };

                    return <OriginComponent {...params} />
                })}
            </div>

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
};

export const PermissionsSettings = connect(mapStateToProps, actions)(PermissionsSettingsComponent);
