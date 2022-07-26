import * as styles from './importEmail.module.css';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Error, Input } from '../../ui';
import * as React from 'react';
import { useAppSelector } from '../../../store';
import { NetworkName } from 'networks/types';

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
  const networkId = useAppSelector(state => state.currentNetwork);

  const [pending, setPending] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<Record<string, string | null>>({
    _form: null,
    emailRequired: null,
    passwordRequired: null,
  });
  const [email, setEmail] = React.useState<string>(userData?.username ?? '');
  const [name, domain] = email.split('@');
  const maskedEmail = `${name[0]}******@${domain}`;
  const [password, setPassword] = React.useState<string>(
    userData?.password ?? ''
  );

  const handleEmailChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(event.target.value.trim());
      setErrors(prev => ({
        ...prev,
        _form: null,
        emailRequired: null,
      }));
    },
    []
  );

  const handleEmailBlur = React.useCallback(() => {
    setErrors(prev => ({
      ...prev,
      emailRequired:
        email.length === 0 || /.+@.+\..+/.test(email) === false
          ? t('importEmail.emailRequired')
          : null,
    }));
  }, [email, t]);

  const handlePasswordChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
      setErrors(prev => ({
        ...prev,
        _form: null,
        passwordRequired: null,
      }));
    },
    []
  );

  const handlePasswordBlur = React.useCallback(() => {
    setErrors(prev => ({
      ...prev,
      passwordRequired:
        password.length === 0 ? t('importEmail.passwordRequired') : null,
    }));
  }, [password.length, t]);

  const handleSubmit = React.useCallback(
    async event => {
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
    [email, password, signIn, t]
  );

  return (
    <form className={className} onSubmit={handleSubmit}>
      <div className="margin1">
        <div className={'tag1 basic500 input-title'}>
          {t('importEmail.emailLabel')}
        </div>

        {userData?.username ? (
          <Input data-testid="emailInput" value={maskedEmail} disabled />
        ) : (
          <Input
            data-testid="emailInput"
            value={email}
            spellCheck={false}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            error={!!errors.emailRequired}
            autoFocus
          />
        )}

        <Error show={errors.emailRequired != null}>
          {errors.emailRequired}
        </Error>
      </div>

      <div className="margin4">
        <div className={'tag1 basic500 input-title'}>
          {t('importEmail.passwordLabel')}
        </div>

        <Input
          data-testid="passwordInput"
          type="password"
          view="password"
          value={password}
          onChange={handlePasswordChange}
          onBlur={handlePasswordBlur}
          error={!!errors.passwordRequired}
          autoFocus={!!userData?.username}
        />
        <Error show={errors.passwordRequired != null}>
          {errors.passwordRequired}
        </Error>
      </div>

      <div className="margin4">
        <Button
          className="fullwidth"
          data-testid="submitButton"
          type="submit"
          view="submit"
          onClick={handleSubmit}
          disabled={pending || !email || !password}
          loading={pending}
        >
          {t('importEmail.continue')}
        </Button>

        <Error show={errors._form != null}>{errors._form}</Error>
      </div>

      <div className={cn(styles.footer, 'body3')}>
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
