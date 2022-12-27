import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Background from 'ui/services/Background';

import { BigLogo } from '../head';
import { Button, ErrorMessage, Input } from '../ui';
import * as styles from './styles/login.styl';

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  return (
    <div className={styles.content}>
      <div className={styles.logoMargin}>
        <BigLogo />
      </div>

      <form
        onSubmit={async event => {
          event.preventDefault();

          try {
            await Background.unlock(password);
          } catch {
            setError(true);
          }
        }}
      >
        <div className="left input-title basic500 tag1">
          {t('login.password')}
        </div>

        <div className="margin-main-big relative">
          <Input
            autoComplete="current-password"
            autoFocus
            error={!!error}
            id="loginPassword"
            type="password"
            value={password}
            view="password"
            onChange={event => {
              setPassword(event.target.value);
              setError(false);
            }}
          />

          <ErrorMessage show={!!error} data-testid="loginPasswordError">
            {t('login.passwordError')}
          </ErrorMessage>
        </div>

        <Button
          id="loginEnter"
          type="submit"
          view="submit"
          className="margin4"
          disabled={!password}
        >
          {t('login.enter')}
        </Button>
      </form>

      <div>
        <div
          className={styles.forgotLnk}
          onClick={() => {
            navigate('/forgot-password');
          }}
        >
          {t('login.passwordForgot')}
        </div>
      </div>
    </div>
  );
}
