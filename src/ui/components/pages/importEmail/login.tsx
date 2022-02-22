import * as React from 'react';
import { SignInForm } from './signInForm';
import { CodeConfirmation } from './codeConfirmation';
import {
  AuthChallenge,
  CodeDelivery,
  IdentityUser,
} from '../../../../controllers/IdentityController';
import { getGeeTestToken } from './geeTest';
import background from '../../../services/Background';

type LoginStateType = 'sign-in' | 'confirm-sign-in';

type UserData = {
  username: string;
  password: string;
};

type LoginProps = {
  className?: string;
  userData?: UserData;
  onConfirm(user: IdentityUser & { name: string }): void;
  onSubmit?(userData: UserData): void;
};

export function Login({
  className = '',
  userData,
  onConfirm,
  onSubmit,
}: LoginProps) {
  const [loginState, setLoginState] = React.useState<LoginStateType>('sign-in');
  const [codeDelivery, setCodeDelivery] = React.useState<CodeDelivery>();
  const [is2FAEnabled, setIs2FAEnabled] = React.useState(false);
  const userRef = React.useRef<UserData>(userData);

  React.useEffect(() => {
    background.identityClear();

    const script = document.createElement('script');
    script.src = 'geeTestCode.js';
    script.async = true;
    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  }, []);

  const handleSuccess = React.useCallback(() => {
    background.identityUser().then((identityUser: IdentityUser) => {
      const [name, domain] = userRef.current.username.split('@');
      onConfirm({
        name: `${name[0]}*******@${domain}`,
        ...identityUser,
      });
    });
  }, [is2FAEnabled, onConfirm]);

  const signIn = React.useCallback(
    async (username: string, password: string): Promise<void> => {
      userRef.current = { username, password };

      if (typeof onSubmit === 'function') {
        onSubmit(userRef.current);
      }

      const config = await background.identityConfig();
      const geeTest = await getGeeTestToken(config.geetest.url);
      const cognitoUser = await background.identitySignIn(
        username,
        password,
        geeTest
      );
      const challengeName: AuthChallenge | void = (cognitoUser as any)
        .challengeName;

      switch (challengeName) {
        case 'SOFTWARE_TOKEN_MFA':
          setCodeDelivery({
            type: 'TOTP',
            destination: 'TOTP device',
          });
          setLoginState('confirm-sign-in');
          setIs2FAEnabled(true);
          break;
        default:
          handleSuccess();
      }
    },
    [handleSuccess]
  );

  const confirmSignIn = React.useCallback(
    async (code: string): Promise<void> => {
      try {
        await background.identityConfirmSignIn(code);
        handleSuccess();
      } catch (e) {
        if (e && e.code === 'NotAuthorizedException' && userRef.current) {
          await signIn(userRef.current.username, userRef.current.password);
        } else {
          throw e;
        }
      }
    },
    [codeDelivery, handleSuccess, signIn]
  );

  React.useEffect(() => {
    if (loginState !== 'confirm-sign-in') {
      setCodeDelivery(undefined);
    }
  }, [loginState]);

  return (
    <>
      {loginState == 'sign-in' ? (
        <SignInForm className={className} userData={userData} signIn={signIn} />
      ) : loginState === 'confirm-sign-in' ? (
        <CodeConfirmation
          className={className}
          codeDelivery={codeDelivery}
          confirmCode={confirmSignIn}
        />
      ) : null}
    </>
  );
}
