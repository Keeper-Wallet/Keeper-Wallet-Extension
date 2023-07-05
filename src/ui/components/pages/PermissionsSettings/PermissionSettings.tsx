import { BigNumber } from '@waves/bignumber';
import clsx from 'clsx';
import { type PopupState } from 'popup/store/types';
import { PureComponent } from 'react';
import { type WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { setShowNotification } from 'store/actions/notifications';
import {
  allowOrigin,
  deleteOrigin,
  disableOrigin,
  setAutoOrigin,
} from 'store/actions/permissions';
import { Loader, Modal } from 'ui/components/ui';

import {
  List,
  OriginSettings,
  Tabs,
  type TAutoAuth,
  type TPermission,
} from './components';
import * as styles from './permissionsSettings.styl';

interface StateProps {
  origins?: { [key: string]: TAutoAuth[] };
  pending?: boolean;
  allowed?: boolean;
  disallowed?: boolean;
  deleted?: boolean;
}

interface DispatchProps {
  allowOrigin: (origin: string) => void;
  deleteOrigin: (origin: string) => void;
  disableOrigin: (origin: string) => void;
  setAutoOrigin: (permissions: {
    origin: string;
    params: Partial<TAutoAuth>;
  }) => void;
  setShowNotification: (permissions: {
    origin: string;
    canUse: boolean | null;
  }) => void;
}

type Props = WithTranslation & StateProps & DispatchProps;

interface State {
  showSettings: boolean;
  originsList: string;
  origin: string | null;
  permissions: TPermission[];
  autoSign: TAutoAuth | null;
  originalAutoSign: TAutoAuth | null;
}

class PermissionsSettingsComponent extends PureComponent<Props, State> {
  state: State = {
    showSettings: false,
    originsList: 'customList',
    origin: null,
    permissions: [],
    autoSign: null,
    originalAutoSign: null,
  };

  deleteHandler = (origin: string) => {
    this.props.deleteOrigin(origin);
    this.closeSettingsHandler();
  };

  showSettingsHandler = (origin: string) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [, permissions] = Object.entries(this.props.origins!).find(
      ([name]) => name === origin,
    )!;
    const autoSign =
      (permissions || []).find(({ type }) => type === 'allowAutoSign') ||
      Object.create(null);
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

  onChangeOriginSettings = (autoSign: TAutoAuth) => {
    this.setState({ autoSign });
  };

  saveSettingsHandler = (
    params: Partial<TAutoAuth>,
    origin: string,
    canShowNotifications: boolean | null,
  ) => {
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
    const className = clsx(styles.content);

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
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          origins={this.props.origins!}
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            originName={this.state.origin!}
            permissions={this.state.permissions}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            origins={origins!}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            autoSign={this.state.autoSign!}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            originalAutoSign={this.state.originalAutoSign!}
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

function mapStateToProps(store: PopupState): StateProps {
  return {
    origins: store.origins,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ...store.permissions,
  };
}

const actions = {
  allowOrigin,
  deleteOrigin,
  disableOrigin,
  setAutoOrigin,
  setShowNotification,
};

export const PermissionsSettings = connect(
  mapStateToProps,
  actions,
)(withTranslation()(PermissionsSettingsComponent));

export type TTabTypes = 'customList' | 'whiteList';
