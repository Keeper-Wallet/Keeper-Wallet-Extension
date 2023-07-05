import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Browser from 'webextension-polyfill';

import { NETWORK_CONFIG } from '../constants';
import { NetworkName } from '../networks/types';
import { usePopupDispatch, usePopupSelector } from '../popup/store/react';
import { setLoading } from '../store/actions/localState';
import {
  setCustomCode,
  setCustomMatcher,
  setCustomNode,
  setNetwork,
} from '../store/actions/network';
import { Modal } from '../ui/components/ui';
import { Tooltip } from '../ui/components/ui/tooltip';
import * as styles from './bottomPanel.module.css';
import { CustomNetworkModal } from './customNetworkModal';

interface Props {
  allowChangingNetwork?: boolean;
}

export function BottomPanel({ allowChangingNetwork }: Props) {
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();

  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const customMatcher = usePopupSelector(state => state.customMatcher);
  const customNodes = usePopupSelector(state => state.customNodes);

  const setNewNetwork = async (network: NetworkName) => {
    dispatch(setLoading(true));
    await dispatch(setNetwork(network));
    setTimeout(() => dispatch(setLoading(false)), 1000);
  };

  const [isDropdownShown, setIsDropdownShown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const dropdownEl = dropdownRef.current;

    if (!isDropdownShown || !dropdownEl) return;

    const handleWindowClick = (event: MouseEvent) => {
      if (
        !(event.target instanceof Node) ||
        dropdownEl.contains(event.target)
      ) {
        return;
      }

      setIsDropdownShown(false);
    };

    addEventListener('click', handleWindowClick, {
      capture: true,
    });

    return () => {
      removeEventListener('click', handleWindowClick, {
        capture: true,
      });
    };
  }, [isDropdownShown]);

  const [isCustomNetworkModalShown, setIsCustomNetworkModalShown] =
    useState(false);

  const networkHash = Object.fromEntries(
    Object.entries(NETWORK_CONFIG).map(([key, network]) => [
      key,
      {
        ...network,
        matcherBaseUrl: customMatcher[network.name] || network.matcherBaseUrl,
        nodeBaseUrl: customNodes[network.name] || network.nodeBaseUrl,
      },
    ]),
  );

  const getNetworkTranslationKey = (network: NetworkName) =>
    `bottom.${network}`;

  return (
    <div className={styles.root}>
      <Tooltip
        className={styles.networkTooltipContent}
        content={t('bottom.network.disabled')}
      >
        {props => (
          <div
            className={styles.network}
            {...(allowChangingNetwork ? undefined : props)}
          >
            <button
              className={styles.dropdownButton}
              disabled={!allowChangingNetwork}
              onClick={() => {
                setIsDropdownShown(true);
              }}
            >
              <i className={clsx(styles.networkIcon, 'networkIcon')} />

              <span className={styles.dropdownButtonText}>
                {t(getNetworkTranslationKey(currentNetwork))}
              </span>
            </button>

            {currentNetwork === NetworkName.Custom && (
              <button
                className={styles.editButton}
                disabled={!allowChangingNetwork}
                onClick={() => {
                  setIsCustomNetworkModalShown(true);
                }}
              >
                {t('bottom.network.edit')}
              </button>
            )}

            {isDropdownShown && (
              <div ref={dropdownRef} className={styles.dropdown}>
                {(Object.keys(NETWORK_CONFIG) as NetworkName[])
                  .filter(network => network !== currentNetwork)
                  .concat(currentNetwork)
                  .map(network => {
                    const isSelected = currentNetwork === network;

                    return (
                      <button
                        key={network}
                        className={clsx(styles.dropdownItem, {
                          [styles.dropdownItem_selected]: isSelected,
                        })}
                        onClick={
                          isSelected
                            ? undefined
                            : () => {
                                setIsDropdownShown(false);

                                const newNet = networkHash[network];

                                if (newNet.nodeBaseUrl) {
                                  setNewNetwork(network);
                                } else {
                                  setIsCustomNetworkModalShown(true);
                                }
                              }
                        }
                      >
                        <i
                          className={clsx(styles.networkIcon, 'networkIcon')}
                        />

                        <i
                          className={clsx(
                            styles.networkIconActive,
                            'networkIconActive',
                          )}
                        />

                        {t(getNetworkTranslationKey(network))}
                      </button>
                    );
                  })}
              </div>
            )}

            <Modal
              showModal={isCustomNetworkModalShown}
              animation={Modal.ANIMATION.FLASH}
            >
              <CustomNetworkModal
                initialMatcher={
                  customMatcher[NetworkName.Custom] ||
                  NETWORK_CONFIG[NetworkName.Custom].matcherBaseUrl
                }
                initialNode={
                  customNodes[NetworkName.Custom] ||
                  NETWORK_CONFIG[NetworkName.Custom].nodeBaseUrl
                }
                onClose={() => {
                  setIsCustomNetworkModalShown(false);
                }}
                onSave={({ matcher, networkCode, node }) => {
                  dispatch(
                    setCustomCode({
                      code: networkCode,
                      network: NetworkName.Custom,
                    }),
                  );

                  dispatch(
                    setCustomNode({
                      network: NetworkName.Custom,
                      node,
                    }),
                  );

                  if (matcher) {
                    dispatch(
                      setCustomMatcher({
                        matcher,
                        network: NetworkName.Custom,
                      }),
                    );
                  }

                  setIsCustomNetworkModalShown(false);

                  if (currentNetwork !== NetworkName.Custom) {
                    setNewNetwork(NetworkName.Custom);
                  }
                }}
              />
            </Modal>
          </div>
        )}
      </Tooltip>

      <div className="version basic500" data-testid="currentVersion">
        v {Browser.runtime.getManifest().version}
      </div>
    </div>
  );
}
