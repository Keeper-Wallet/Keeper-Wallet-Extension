import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NETWORK_CONFIG } from '../../../constants';
import { NetworkName } from '../../../networks/types';
import { usePopupDispatch, usePopupSelector } from '../../../popup/store/react';
import {
  setCustomCode,
  setCustomMatcher,
  setCustomNode,
} from '../../../store/actions/network';
import { getMatcherPublicKey, getNetworkCode } from '../../utils/waves';
import { Button, Copy, ErrorMessage, Input, Modal } from '../ui';
import * as styles from './styles/settings.styl';

export function NetworkSettings() {
  const { t } = useTranslation();

  const dispatch = usePopupDispatch();

  const currentNetwork = usePopupSelector(state => state.currentNetwork);

  const customMatcher = usePopupSelector(
    state => state.customMatcher[state.currentNetwork],
  );

  const customNode = usePopupSelector(
    state => state.customNodes[state.currentNetwork],
  );

  const defaultNetworkConfig = NETWORK_CONFIG[currentNetwork];

  const initialNodeValue = customNode || defaultNetworkConfig.nodeBaseUrl;
  const [nodeValue, setNodeValue] = useState(initialNodeValue);
  const [nodeError, setNodeError] = useState(false);

  const initialMatcherValue =
    customMatcher || defaultNetworkConfig.matcherBaseUrl;
  const [matcherValue, setMatcherValue] = useState(initialMatcherValue);
  const [matcherError, setMatcherError] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCopied, setShowCopied] = useState(false);
  useEffect(() => {
    if (!showCopied) return;

    const timeout = setTimeout(() => {
      setShowCopied(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [showCopied]);

  const [showSaved, setShowSaved] = useState(false);
  useEffect(() => {
    if (!showSaved) return;

    const timeout = setTimeout(() => {
      setShowSaved(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [showSaved]);

  const [showSetDefault, setShowSetDefault] = useState(false);
  useEffect(() => {
    if (!showSetDefault) return;

    const timeout = setTimeout(() => {
      setShowSetDefault(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [showSetDefault]);

  return (
    <form
      className={styles.networkTab}
      onSubmit={async event => {
        event.preventDefault();
        setIsSubmitting(true);

        const [nodeIsValid, matcherIsValid] = await Promise.all([
          getNetworkCode(nodeValue).then(
            networkCode => {
              if (currentNetwork === NetworkName.Custom) {
                dispatch(
                  setCustomCode({ code: networkCode, network: currentNetwork }),
                );
              } else if (networkCode !== defaultNetworkConfig.networkCode) {
                return false;
              }

              dispatch(
                setCustomNode({
                  network: currentNetwork,
                  node:
                    nodeValue === defaultNetworkConfig.nodeBaseUrl
                      ? null
                      : nodeValue,
                }),
              );

              return true;
            },
            () => false,
          ),

          getMatcherPublicKey(matcherValue).then(
            () => {
              dispatch(
                setCustomMatcher({
                  matcher:
                    matcherValue === defaultNetworkConfig.matcherBaseUrl
                      ? null
                      : matcherValue,
                  network: currentNetwork,
                }),
              );

              return true;
            },
            () => false,
          ),
        ]);

        setNodeError(!nodeIsValid);
        setMatcherError(!matcherIsValid);

        if (nodeIsValid && matcherIsValid) {
          setShowSaved(true);
        }

        setIsSubmitting(false);
      }}
    >
      <h2 className="title1 margin-main-big">
        {t('networksSettings.network')}
      </h2>

      <div className="margin-main-big relative">
        <label className="input-title basic500 tag1" htmlFor="node_address">
          <Copy
            text={nodeValue}
            onCopy={() => {
              setShowCopied(true);
            }}
          >
            <i className={clsx(styles.copyIcon, 'copy-icon')}> </i>
          </Copy>

          {t('networksSettings.node')}
        </label>

        <Input
          disabled={isSubmitting}
          id="node_address"
          type="url"
          value={nodeValue}
          onChange={event => {
            setNodeValue(event.currentTarget.value);
            setNodeError(false);
          }}
        />

        <ErrorMessage show={nodeError} data-testid="nodeAddressError">
          {t('networkSettings.nodeError')}
        </ErrorMessage>
      </div>

      <div className="margin-main-big relative">
        <label className="input-title basic500 tag1" htmlFor="matcher_address">
          <Copy
            text={matcherValue}
            onCopy={() => {
              setShowCopied(true);
            }}
          >
            <i className={clsx(styles.copyIcon, 'copy-icon')}> </i>
          </Copy>

          {t('networksSettings.matcher')}
        </label>

        <Input
          disabled={isSubmitting}
          id="matcher_address"
          type="url"
          value={matcherValue}
          onChange={event => {
            setMatcherValue(event.currentTarget.value);
            setMatcherError(false);
          }}
        />

        <ErrorMessage show={matcherError}>
          {t('networkSettings.matcherError')}
        </ErrorMessage>
      </div>

      <Button
        className="margin-main-big"
        disabled={
          isSubmitting ||
          (nodeValue === initialNodeValue &&
            matcherValue === initialMatcherValue)
        }
        loading={isSubmitting}
        type="submit"
        view="submit"
      >
        {t('networksSettings.save')}
      </Button>

      {currentNetwork !== NetworkName.Custom && (
        <Button
          disabled={
            isSubmitting ||
            (nodeValue === defaultNetworkConfig.nodeBaseUrl &&
              matcherValue === defaultNetworkConfig.matcherBaseUrl)
          }
          id="setDefault"
          onClick={() => {
            dispatch(setCustomNode({ network: currentNetwork, node: null }));

            dispatch(
              setCustomMatcher({ matcher: null, network: currentNetwork }),
            );

            setNodeValue(defaultNetworkConfig.nodeBaseUrl);
            setNodeError(false);

            setMatcherValue(defaultNetworkConfig.matcherBaseUrl);
            setMatcherError(false);

            setShowSetDefault(true);
          }}
        >
          {t('networksSettings.setDefault')}
        </Button>
      )}

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopied}>
        <div className="modal notification">{t('networksSettings.copied')}</div>
      </Modal>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showSaved}>
        <div className="modal notification">
          {t('networksSettings.savedModal')}
        </div>
      </Modal>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showSetDefault}>
        <div className="modal notification">
          {t('networksSettings.setDefaultModal')}
        </div>
      </Modal>
    </form>
  );
}
