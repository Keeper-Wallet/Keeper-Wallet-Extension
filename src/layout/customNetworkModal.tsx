import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NetworkName } from '../networks/types';
import { Button } from '../ui/components/ui/buttons/Button';
import { ErrorMessage } from '../ui/components/ui/error';
import { Input } from '../ui/components/ui/input/Input';
import { getMatcherPublicKey, getNetworkCode } from '../ui/utils/waves';

interface Props {
  initialMatcher: string;
  initialNode: string;
  onClose: () => void;
  onSave: (networkConfig: {
    matcher: string;
    networkCode: string;
    node: string;
  }) => void;
}

export function CustomNetworkModal({
  initialMatcher,
  initialNode,
  onClose,
  onSave,
}: Props) {
  const { t } = useTranslation();

  const [matcher, setMatcher] = useState(() => initialMatcher);
  const [matcherError, setMatcherError] = useState(false);

  const [node, setNode] = useState(() => initialNode);
  const [nodeError, setNodeError] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="modal cover">
      <form
        className="modal-form"
        id="customNetwork"
        onSubmit={async event => {
          event.preventDefault();

          setMatcherError(false);
          setNodeError(false);
          setIsSubmitting(true);

          const [networkCodeResult, matcherPublicKeyResult] =
            await Promise.allSettled([
              getNetworkCode(node),
              matcher ? getMatcherPublicKey(matcher) : undefined,
            ]);

          setNodeError(networkCodeResult.status === 'rejected');
          setMatcherError(matcherPublicKeyResult.status === 'rejected');

          if (
            networkCodeResult.status === 'fulfilled' &&
            matcherPublicKeyResult.status === 'fulfilled'
          ) {
            const networkCode = networkCodeResult.value;

            onSave({
              matcher,
              networkCode,
              node,
            });
          }

          setIsSubmitting(false);
        }}
      >
        <h2 className="headline2 margin-main-big">
          {t(`bottom.${NetworkName.Custom}`)}{' '}
          {t('networkSettings.customNetwork')}
        </h2>

        <div className="margin-main-big relative">
          <label className="input-title basic500 tag1" htmlFor="node_address">
            {t('networksSettings.node')}
          </label>

          <Input
            autoFocus
            disabled={isSubmitting}
            id="node_address"
            type="url"
            value={node ?? ''}
            onChange={event => {
              setNode(event.currentTarget.value);
              setNodeError(false);
            }}
          />

          <ErrorMessage show={nodeError} data-testid="nodeAddressError">
            {node
              ? t('networkSettings.nodeError')
              : t('networkSettings.nodeUrlEmpty')}
          </ErrorMessage>
        </div>

        <div className="margin-main-big relative">
          <label
            className="input-title basic500 tag1"
            htmlFor="matcher_address"
          >
            {t('networksSettings.matcher')}
          </label>

          <Input
            disabled={isSubmitting}
            id="matcher_address"
            type="url"
            value={matcher ?? ''}
            onChange={event => {
              setMatcher(event.currentTarget.value);
              setMatcherError(false);
            }}
          />

          <ErrorMessage show={matcherError}>
            {t('networkSettings.matcherError')}
          </ErrorMessage>
        </div>

        <Button
          className="margin-main-big relative"
          disabled={isSubmitting}
          id="networkSettingsSave"
          loading={isSubmitting}
          type="submit"
          view="submit"
        >
          {t('networkSettings.saveAndApply')}
        </Button>

        <div className="center">
          <Button disabled={isSubmitting} view="transparent" onClick={onClose}>
            {t('networkSettings.cancel')}
          </Button>
        </div>

        <Button
          className="modal-close"
          disabled={isSubmitting}
          view="transparent"
          onClick={onClose}
        />
      </form>
    </div>
  );
}
