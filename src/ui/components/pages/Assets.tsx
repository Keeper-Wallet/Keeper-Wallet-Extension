import * as styles from './styles/assets.styl';
import * as React from 'react';
import { ActiveAccountCard } from '../accounts/activeAccountCard';
import { Trans } from 'react-i18next';
import { getAsset, setActiveAccount, setUiState } from '../../actions';
import { PAGES } from '../../pageConfig';
import { Asset, Money } from '@waves/data-entities';
import { Modal } from '../ui';
import { Intro } from './Intro';
import { FeatureUpdateInfo } from './FeatureUpdateInfo';
import { useAppDispatch, useAppSelector } from 'ui/store';

interface Props {
  setTab: (newTab: string) => void;
}

export function Assets({ setTab }: Props) {
  const dispatch = useAppDispatch();

  const activeAccount = useAppSelector(state =>
    state.accounts.find(
      ({ address }) => address === state.selectedAccount.address
    )
  );

  const assets = useAppSelector(state => state.assets);
  const balances = useAppSelector(state => state.balances);
  const notifications = useAppSelector(state => state.localState.notifications);
  const showUpdateInfo = useAppSelector(
    state => !state.uiState.isFeatureUpdateShown && !!state.accounts.length
  );

  const [showCopy, setShowCopy] = React.useState(false);

  React.useEffect(() => {
    if (!assets['WAVES']) {
      dispatch(getAsset('WAVES'));
    }
  }, [assets, dispatch, getAsset]);

  if (!activeAccount) {
    return <Intro />;
  }

  const onSelectHandler = account => {
    dispatch(setActiveAccount(account));
    setTab(PAGES.ACCOUNT_INFO);
  };

  const balancesMoney: Record<string, Money> = {};

  const assetInfo = assets['WAVES'];

  if (assetInfo) {
    const asset = new Asset(assetInfo);

    Object.entries<{ available: string }>(balances).forEach(
      ([key, { available }]) => {
        balancesMoney[key] = new Money(available, asset);
      }
    );
  }

  return (
    <div className={styles.assets}>
      <div className={styles.activeAccount}>
        <ActiveAccountCard
          account={activeAccount}
          balance={balancesMoney[activeAccount.address]}
          onCopy={() => {
            setShowCopy(true);
            setTimeout(() => setShowCopy(false), 1000);
          }}
          onOtherAccountsClick={() => {
            setTab(PAGES.OTHER_ACCOUNTS);
          }}
          onClick={onSelectHandler}
          onShowQr={() => {
            setTab(PAGES.QR_CODE_SELECTED);
          }}
        />
      </div>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopy}>
        <div className="modal notification">
          <Trans i18nKey="assets.copied" />
        </div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={notifications.accountCreationSuccess}
      >
        <div className="modal notification">
          <div>
            <Trans i18nKey="assets.accountCreationSuccessNotification" />
          </div>
        </div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={notifications.accountImportSuccess}
      >
        <div className="modal notification">
          <div>
            <Trans i18nKey="assets.accountImportSuccessNotification" />
          </div>
        </div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={notifications.selected}
      >
        <div className="modal notification">
          <div>
            <Trans i18nKey="assets.selectAccountNotification" />
          </div>
        </div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={notifications.deleted}
      >
        <div className="modal notification active-asset">
          <div>
            <Trans i18nKey="assets.deleteAccount" />
          </div>
        </div>
      </Modal>

      <Modal animation={Modal.ANIMATION.FLASH} showModal={showUpdateInfo}>
        <FeatureUpdateInfo
          onClose={() => {
            dispatch(setUiState({ isFeatureUpdateShown: true }));
          }}
          onSubmit={() => {
            dispatch(setUiState({ isFeatureUpdateShown: true }));
            setTab(PAGES.EXPORT_ACCOUNTS);
          }}
        />
      </Modal>
    </div>
  );
}
