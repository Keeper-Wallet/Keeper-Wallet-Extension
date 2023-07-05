import clsx from 'clsx';
import { NetworkName } from 'networks/types';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePopupSelector } from '../../../../popup/store/react';
import { Button, ErrorMessage, Input } from '../../ui';
import * as styles from './importEmail.module.css';

const baseByNetwork: Partial<Record<NetworkName, string>> = {
  [NetworkName.Mainnet]: 'https://waves.exchange',
  [NetworkName.Testnet]: 'https://testnet.waves.exchange',
};

interface Props {
  className?: string;
  userData: { username: string; password: string } | undefined;
  signIn: (username: string, password: string) => void;
}

export function SignInForm({ className, userData, signIn }: Props) {
  const { t } = useTranslation();
  const networkId = usePopupSelector(state => state.currentNetwork);

  const [pending, setPending] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({
    _form: null,
    emailRequired: null,
    passwordRequired: null,
  });
  const [email, setEmail] = useState<string>(userData?.username ?? '');
  const [name, domain] = email.split('@');
  const maskedEmail = `${name[0]}******@${domain}`;
  const [password, setPassword] = useState<string>(userData?.password ?? '');

  const handleEmailChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(event.target.value.trim());
      setErrors(prev => ({
        ...prev,
        _form: null,
        emailRequired: null,
      }));
    },
    [],
  );

  const handleEmailBlur = useCallback(() => {
    setErrors(prev => ({
      ...prev,
      emailRequired:
        email.length === 0 || /.+@.+\..+/.test(email) === false
          ? t('importEmail.emailRequired')
          : null,
    }));
  }, [email, t]);

  const handlePasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
      setErrors(prev => ({
        ...prev,
        _form: null,
        passwordRequired: null,
      }));
    },
    [],
  );

  const handlePasswordBlur = useCallback(() => {
    setErrors(prev => ({
      ...prev,
      passwordRequired:
        password.length === 0 ? t('importEmail.passwordRequired') : null,
    }));
  }, [password.length, t]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setPending(true);

      try {
        await signIn(email, password);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        let errMessage = err?.message;

        switch (errMessage) {
          case 'User does not exist.':
            errMessage = t('importEmail.userDoesNotExist');
            break;
          case 'Incorrect username or password.':
            errMessage = t('importEmail.incorrectUsernameOrPassword');
            break;
          case 'You have exceeded incorrect username or password limit. If you have any problems, please contact support https://support.waves.exchange/.':
            errMessage = t('importEmail.incorrectUsernameOrPasswordLimit');
            break;
          default:
            break;
        }

        setErrors(prev => ({
          ...prev,
          _form: errMessage,
        }));
      } finally {
        setPending(false);
      }
    },
    [email, password, signIn, t],
  );

  return (
    <form className={className} onSubmit={handleSubmit}>
      <div className="margin1">
        <div className="tag1 basic500 input-title">
          {t('importEmail.emailLabel')}
        </div>

        {userData?.username ? (
          <Input data-testid="emailInput" value={maskedEmail} disabled />
        ) : (
          <Input
            autoComplete="email"
            autoFocus
            data-testid="emailInput"
            error={!!errors.emailRequired}
            spellCheck={false}
            value={email}
            onBlur={handleEmailBlur}
            onChange={handleEmailChange}
          />
        )}

        <ErrorMessage show={errors.emailRequired != null}>
          {errors.emailRequired}
        </ErrorMessage>
      </div>

      <div className="margin4">
        <div className="tag1 basic500 input-title">
          {t('importEmail.passwordLabel')}
        </div>

        <Input
          autoComplete="current-password"
          autoFocus={!!userData?.username}
          data-testid="passwordInput"
          error={!!errors.passwordRequired}
          onBlur={handlePasswordBlur}
          onChange={handlePasswordChange}
          type="password"
          value={password}
          view="password"
        />
        <ErrorMessage show={errors.passwordRequired != null}>
          {errors.passwordRequired}
        </ErrorMessage>
      </div>

      <div className="margin4">
        <Button
          className="fullwidth"
          data-testid="submitButton"
          type="submit"
          view="submit"
          disabled={pending || !email || !password}
          loading={pending}
        >
          {t('importEmail.continue')}
        </Button>

        <ErrorMessage show={errors._form != null}>{errors._form}</ErrorMessage>
      </div>

      <div className={clsx(styles.footer, 'body3')}>
        <a
          rel="noopener noreferrer"
          className="margin1 link blue"
          href={`${baseByNetwork[networkId]}/sign-in/email`}
          target="_blank"
        >
          {t('importEmail.forgotPassword')}
        </a>

        {!userData?.username && (
          <div>
            {t('importEmail.dontHaveAccount')}
            &nbsp;
            <a
              rel="noopener noreferrer"
              className="link blue"
              href={`${baseByNetwork[networkId]}/sign-up/email`}
              target="_blank"
            >
              {t('importEmail.signUp')}
            </a>
          </div>
        )}
      </div>
    </form>
  );
}
