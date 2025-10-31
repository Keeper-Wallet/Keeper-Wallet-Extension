import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { notificationChangeName } from 'store/actions/localState';
import Background from 'ui/services/Background';

import { CONFIG } from '../../appConfig';
import { useWalletValidation } from '../../hooks/useWalletValidation';
import { Button, Input } from '../ui';
import * as styles from './styles/changeName.styl';

export function ChangeAccountName() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const params = useParams<{ address: string }>();

  const dispatch = usePopupDispatch();
  const currentNetwork = usePopupSelector(state => state.currentNetwork);

  const account = usePopupSelector(state =>
    state.accounts.find(x => x.address === params.address),
  );

  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const { validateWalletName } = useWalletValidation();

  const validateName = useCallback(
    async (name: string, excludeCurrentName = false) => {
      if (!name || name.trim().length === 0) {
        setError(t('changeName.errorRequired'));
        return false;
      }

      if (name.length < CONFIG.NAME_MIN_LENGTH) {
        setError(t('changeName.errorRequired'));
        return false;
      }

      // Skip validation if it's the same as current name
      if (excludeCurrentName && account && name === account.name) {
        setError(null);
        return true;
      }

      setIsValidating(true);
      try {
        const validation = await validateWalletName(name);
        if (!validation.isValid) {
          setError(validation.error || t('changeName.errorInUse'));
          return false;
        }

        setError(null);
        return true;
      } catch (validationError) {
        setError(t('newAccountName.errorValidationFailed'));
        return false;
      } finally {
        setIsValidating(false);
      }
    },
    [validateWalletName, t, account],
  );

  useEffect(() => {
    if (newName) {
      validateName(newName, true);
    } else {
      setError(null);
    }
  }, [newName, validateName]);

  return (
    <div className={styles.content}>
      <h2 className="title1 margin3 left">{t('changeName.title')}</h2>

      <div className="tag1 basic500 input-title">
        {t('changeName.currentName')}
      </div>

      <div id="currentAccountName" className="body1 font400 margin-main-big">
        {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          account!.name
        }
      </div>

      <div className="separator margin-main-big" />

      <form
        onSubmit={async event => {
          event.preventDefault();

          await Background.editWalletName(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            account!.address,
            newName,
            currentNetwork,
          );

          dispatch(notificationChangeName(true));

          navigate(-1);
        }}
      >
        <div className="tag1 basic500 input-title">
          {t('changeName.newName')}
        </div>

        <div className="margin-main-big relative">
          <Input
            autoFocus
            error={!!error}
            id="newAccountName"
            maxLength={26}
            value={newName}
            onChange={event => {
              const value = event.currentTarget.value;
              setNewName(value);
            }}
          />

          {error && (
            <div className="error-message" data-testid="newAccountNameError">
              {error}
            </div>
          )}
        </div>

        <Button
          id="save"
          type="submit"
          view="submit"
          disabled={!!error || !newName || isValidating}
        >
          {t('changeName.save')}
        </Button>
      </form>
    </div>
  );
}
