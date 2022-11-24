import cn from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { deleteAllAccounts } from 'ui/actions/user';
import { Button, ErrorMessage, Input } from 'ui/components/ui';
import { useAppDispatch } from 'ui/store';

import * as styles from './deleteAccounts.module.css';

export function DeleteAllAccounts() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [phrase, setPhrase] = useState<string | null>(null);
  const [isBlur, setBlur] = useState(false);

  const defaultPhrase = t('forgotPassword.phrase');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
  const isCorrectLength = phrase?.length! >= defaultPhrase.length;
  const hasError = phrase !== defaultPhrase;

  function handleInput(event: React.FormEvent<HTMLInputElement>) {
    setPhrase(event.currentTarget.value);
    setBlur(false);
  }

  function handleBlur() {
    setBlur(false);
  }

  return (
    <div className={styles.content} data-testid="deleteAllAccounts">
      <i className={cn('error-icon', styles.errorIcon)} />

      <h2 className="title1 margin1">{t('forgotPassword.attention')}</h2>

      <div className="body1 margin1">
        {t('forgotPassword.attentionMessage')}
      </div>

      <div className={cn('plate', 'body1', 'margin1', styles.error)}>
        {t('forgotPassword.warningMessage')}
      </div>
      <div className="margin1 margin-main-big-top">
        {t('forgotPassword.continueMessage')}
      </div>

      <div
        className="plate center margin1 cant-select"
        data-testid="defaultPhrase"
      >
        {t('forgotPassword.phrase')}
      </div>
      <div>
        <Input
          autoFocus
          autoComplete="off"
          type="input"
          className="margin1"
          placeholder={t('forgotPassword.placeholder')}
          onInput={handleInput}
          onBlur={handleBlur}
          data-testid="confirmPhrase"
        />
        <ErrorMessage
          className={cn('margin1', styles.error)}
          show={hasError && (isBlur || isCorrectLength)}
          data-testid="confirmPhraseError"
        >
          {t('forgotPassword.phraseError')}
        </ErrorMessage>
      </div>

      <div className="buttons-wrapper">
        <Button
          type="button"
          onClick={() => {
            navigate(-1);
          }}
          data-testid="resetCancel"
        >
          {t('forgotPassword.resetCancel')}
        </Button>
        <Button
          type="button"
          view="warning"
          disabled={hasError}
          onClick={async () => {
            await dispatch(deleteAllAccounts());
            navigate('/', { replace: true });
          }}
          data-testid="resetConfirm"
        >
          {t('forgotPassword.resetConfirm')}
        </Button>
      </div>
    </div>
  );
}
