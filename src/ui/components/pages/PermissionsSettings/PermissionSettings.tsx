import * as styles from './permissionsSettings.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
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

class PermissionsSettingsComponent extends React.PureComponent {
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
    const [_, permissions] = Object.entries(this.props.origins).find(
      ([name]) => name === origin
    );
    const autoSign =
      ((permissions as any) || []).find(
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
    const tabs = ['customList', 'whiteList'].map(name => ({
      item: (
        <Trans key={name} i18nKey={`permission.${name}`}>
          {name}
        </Trans>
      ),
      name,
    }));
    const className = cn(styles.content);

    const { origins, pending, allowed, disallowed, deleted } = this.props;

    return (
      <div className={className}>
        <h2 className="title1 center margin-main-big">
          <Trans i18nKey="permissionsSettings.title">Permissions control</Trans>
        </h2>

        <Loader hide={!pending} />

        <Tabs
          tabs={tabs}
          currentTab={this.state.originsList}
          onSelectTab={originsList => this.setState({ originsList })}
        />

        <List
          origins={this.props.origins}
          showType={this.state.originsList as any}
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
            {allowed ? (
              <Trans i18nKey="permissionsSettings.notify.allowed">
                Allowed!
              </Trans>
            ) : null}
            {disallowed ? (
              <Trans i18nKey="permissionsSettings.notify.disallowed">
                Disallowed!
              </Trans>
            ) : null}
            {deleted ? (
              <Trans i18nKey="permissionsSettings.notify.deleted">
                Deleted!
              </Trans>
            ) : null}
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
)(PermissionsSettingsComponent);
