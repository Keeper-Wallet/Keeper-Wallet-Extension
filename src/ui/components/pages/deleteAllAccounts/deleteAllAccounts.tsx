import * as styles from './deleteAccounts.module.css';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Error, Input } from 'ui/components/ui';
import { deleteAccount } from 'ui/actions';
import cn from 'classnames';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { PAGES_CONF } from 'ui/pageConfig';

export function DeleteAllAccounts({ onBack }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const pageConf = useAppSelector(state => PAGES_CONF[state.tab]);
  const [phrase, setPhrase] = React.useState(null);
  const [isBlur, setBlur] = React.useState(false);

  const defaultPhrase = t('forgotPassword.phrase');
  const isCorrectLength = phrase?.length >= defaultPhrase.length;
  const hasError = phrase !== defaultPhrase;

  function handleInput(event) {
    setPhrase(event.target.value);
    setBlur(false);
  }

  function handleBlur() {
    setBlur(false);
  }

  return (
    <form
      className={cn(
        styles.content,
        pageConf.menu.hasLogo && styles.subtractMenu
      )}
      onSubmit={e => {
        e.preventDefault();
        dispatch(deleteAccount());
      }}
    >
      <i className={cn('error-icon', styles.errorIcon)} />

      <h2 className="title1 margin1">
        <Trans i18nKey="forgotPassword.attention" />
      </h2>

      <div className="body1 margin1">
        <Trans i18nKey="forgotPassword.attentionMessage" />
      </div>

      <div className={cn('plate', 'body1', 'margin1', styles.error)}>
        <Trans i18nKey="forgotPassword.warningMessage" />
      </div>
      <div className="margin1 margin-main-big-top">
        <Trans i18nKey="forgotPassword.continueMessage" />
      </div>

      <div id="defaultPhrase" className="plate center margin1 cant-select">
        <Trans i18nKey="forgotPassword.phrase" />
      </div>
      <div>
        <Input
          autoFocus
          autoComplete="off"
          id="confirmPhrase"
          type="input"
          className="margin1"
          placeholder="Type here..."
          onInput={handleInput}
          onBlur={handleBlur}
        />
        <Error
          className={cn('margin1', styles.error)}
          show={hasError && (isBlur || isCorrectLength)}
        >
          <Trans i18nKey="forgotPassword.phraseError" />
        </Error>
      </div>

      <div className="buttons-wrapper">
        <Button id="resetCancel" type="button" onClick={onBack}>
          <Trans i18nKey="forgotPassword.resetCancel" />
        </Button>
        <Button id="resetConfirm" type="warning" disabled={hasError}>
          <Trans i18nKey="forgotPassword.resetConfirm" />
        </Button>
      </div>
    </form>
  );
}
