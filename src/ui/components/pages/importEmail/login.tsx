import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  CodeDelivery,
  IdentityUser,
} from '../../../../controllers/IdentityController';
import background from '../../../services/Background';
import { CodeConfirmation } from './codeConfirmation';
import { SignInForm } from './signInForm';

type LoginStateType = 'sign-in' | 'confirm-sign-in';

export interface UserData {
  username: string;
  password: string;
}

type LoginProps = {
  className?: string;
  userData?: UserData;
  onConfirm(user: IdentityUser & { name: string }): void;
  onSubmit?(userData: UserData): void;
};

export function Login({
  className,
  userData,
  onConfirm,
  onSubmit,
}: LoginProps) {
  const [loginState, setLoginState] = useState<LoginStateType>('sign-in');
  const [codeDelivery, setCodeDelivery] = useState<CodeDelivery>();
  const userRef = useRef<UserData | undefined>(userData);

  useEffect(() => {
    background.identityClear();
  }, []);

  const handleSuccess = useCallback(() => {
    background.identityUser().then(identityUser => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const [name, domain] = userRef.current!.username.split('@');
      onConfirm({
        name: `${name[0]}*******@${domain}`,
        ...identityUser,
      });
    });
  }, [onConfirm]);

  const signIn = useCallback(
    async (username: string, password: string): Promise<void> => {
      userRef.current = { username, password };

      if (typeof onSubmit === 'function') {
        onSubmit(userRef.current);
      }

      const { challengeName } = await background.identitySignIn(
        username,
        password,
      );

      switch (challengeName) {
        case 'SOFTWARE_TOKEN_MFA':
          setCodeDelivery({
            type: 'TOTP',
            destination: 'TOTP device',
          });
          setLoginState('confirm-sign-in');
          break;
        default:
          handleSuccess();
      }
    },
    [onSubmit, handleSuccess],
  );

  const confirmSignIn = useCallback(
    async (code: string): Promise<void> => {
      try {
        await background.identityConfirmSignIn(code);
        handleSuccess();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e && e.code === 'NotAuthorizedException' && userRef.current) {
          await signIn(userRef.current.username, userRef.current.password);
        } else {
          throw e;
        }
      }
    },
    [handleSuccess, signIn],
  );

  useEffect(() => {
    if (loginState !== 'confirm-sign-in') {
      setCodeDelivery(undefined);
    }
  }, [loginState]);

  return (
    <>
      {loginState === 'sign-in' ? (
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
