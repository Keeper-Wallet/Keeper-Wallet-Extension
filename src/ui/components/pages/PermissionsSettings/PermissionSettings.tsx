import * as styles from './permissionsSettings.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';
import {
  allowOrigin,
  deleteOrigin,
  disableOrigin,
  setAutoOrigin,
  setShowNotification,
} from 'ui/actions';
import cn from 'classnames';
import { Loader, Modal } from 'ui/components/ui';
import { List, OriginSettings, Tabs } from './components';
import { BigNumber } from '@waves/bignumber';

interface Props extends WithTranslation {
  origins?: { [key: string]: Array<string | IAutoAuth> };
  pending?: boolean;
  allowed?: boolean;
  disallowed?: boolean;
  deleted?: boolean;

  deleteOrigin?: (origin: string) => void;
  allowOrigin?: (origin: string) => void;
  disableOrigin?: (origin: string) => void;
  setAutoOrigin?: (permissions: unknown) => void;
  setShowNotification?: (permissions: unknown) => void;
}

class PermissionsSettingsComponent extends React.PureComponent<Props> {
  readonly state = {
    showSettings: false,
    originsList: 'customList',
    origin: null,
    permissions: [],
    autoSign: null,
    originalAutoSign: null,
  };
  readonly props;

  deleteHandler = origin => {
    this.props.deleteOrigin(origin);
    this.closeSettingsHandler();
  };

  showSettingsHandler = (origin: string) => {
    const [, permissions] = Object.entries(this.props.origins).find(
      ([name]) => name === origin
    );
    const autoSign =
      ((permissions as unknown[]) || []).find(
        ({ type }) => type === 'allowAutoSign'
      ) || Object.create(null);
    const amount = new BigNumber(autoSign.totalAmount).div(10 ** 8);
    autoSign.totalAmount = amount.isNaN() ? 0 : amount.toFormat();
    this.setState({
      origin,
      autoSign,
      permissions,
      originalAutoSign: autoSign,
      showSettings: true,
    });
  };

  toggleApproveHandler = (origin: string, enable: boolean) => {
    if (enable) {
      this.props.allowOrigin(origin);
    } else {
      this.props.disableOrigin(origin);
    }
  };

  onChangeOriginSettings = autoSign => {
    this.setState({ autoSign });
  };

  saveSettingsHandler = (params, origin, canShowNotifications) => {
    this.props.setAutoOrigin({ origin, params });
    this.props.setShowNotification({ origin, canUse: canShowNotifications });
    this.closeSettingsHandler();
  };

  closeSettingsHandler = () => {
    this.setState({ showSettings: false });
  };

  resetSettingsHandler = () => {
    this.setState({ origin: null, permissions: [] });
  };

  render() {
    const { t, origins, pending, allowed, disallowed, deleted } = this.props;
    const tabs = ['customList', 'whiteList'].map(name => ({
      item: t(`permission.${name}`),
      name,
    }));
    const className = cn(styles.content);

    return (
      <div className={className}>
        <h2 className="title1 center margin-main-big">
          {t('permissionsSettings.title')}
        </h2>

        <Loader hide={!pending} />

        <Tabs
          tabs={tabs}
          currentTab={this.state.originsList}
          onSelectTab={originsList => this.setState({ originsList })}
        />

        <List
          origins={this.props.origins}
          showType={this.state.originsList as TTabTypes}
          showSettings={this.showSettingsHandler}
          toggleApprove={this.toggleApproveHandler}
        />

        <Modal
          showModal={this.state.showSettings}
          animation={Modal.ANIMATION.FLASH}
          onExited={this.resetSettingsHandler}
        >
          <OriginSettings
            originName={this.state.origin}
            permissions={this.state.permissions}
            origins={origins}
            autoSign={this.state.autoSign}
            originalAutoSign={this.state.originalAutoSign}
            onSave={this.saveSettingsHandler}
            onChangePerms={this.onChangeOriginSettings}
            onClose={this.closeSettingsHandler}
            onDelete={this.deleteHandler}
          />
        </Modal>

        <Modal
          animation={Modal.ANIMATION.FLASH_SCALE}
          showModal={allowed || disallowed || deleted}
        >
          <div className="modal notification">
            {allowed ? t('permissionsSettings.notify.allowed') : null}
            {disallowed ? t('permissionsSettings.notify.disallowed') : null}
            {deleted ? t('permissionsSettings.notify.deleted') : null}
          </div>
        </Modal>
      </div>
    );
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

export const PermissionsSettings = connect(
  mapStateToProps,
  actions
)(withTranslation()(PermissionsSettingsComponent));

export interface IAutoAuth {
  type: 'allowAutoSign';
  totalAmount: number;
  interval: number;
  approved: Array<unknown>;
}

export type TTabTypes = 'customList' | 'whiteList' | 'blackList';
