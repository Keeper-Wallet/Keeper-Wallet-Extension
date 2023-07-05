import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { notificationChangeName } from 'store/actions/localState';
import Background from 'ui/services/Background';

import { CONFIG } from '../../appConfig';
import { Button, ErrorMessage, Input } from '../ui';
import * as styles from './styles/changeName.styl';

function validateName(name: string, accounts: PreferencesAccount[]) {
  const errors: Array<{ code: number; key: string; msg: string }> = [];
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const names = accounts.map(({ name }) => name);

  if (name.length < CONFIG.NAME_MIN_LENGTH) {
    errors.push({
      code: 1,
      key: 'changeName.errorRequired',
      msg: 'Required name',
    });
  }

  if (names.includes(name)) {
    errors.push({
      code: 2,
      key: 'changeName.errorInUse',
      msg: 'Name already exist',
    });
  }

  return errors;
}

export function ChangeAccountName() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const params = useParams<{ address: string }>();

  const dispatch = usePopupDispatch();
  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const accounts = usePopupSelector(state => state.accounts);

  const account = usePopupSelector(state =>
    state.accounts.find(x => x.address === params.address),
  );

  const [error, setError] = useState(false);

  const [errors, setErrors] = useState<ReturnType<typeof validateName>>([]);

  const [newName, setNewName] = useState('');

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
            error={error}
            id="newAccountName"
            maxLength={26}
            value={newName}
            onBlur={() => {
              // eslint-disable-next-line @typescript-eslint/no-shadow
              const errors = validateName(newName, accounts);

              setErrors(errors);
              setError(errors.length !== 0);
            }}
            onChange={event => {
              // eslint-disable-next-line @typescript-eslint/no-shadow
              const newName = event.currentTarget.value;

              setNewName(newName);
              setError(false);
              setErrors(validateName(newName, accounts));
            }}
          />

          <ErrorMessage
            show={error}
            errors={errors}
            data-testid="newAccountNameError"
          />
        </div>

        <Button
          id="save"
          type="submit"
          view="submit"
          disabled={errors.length !== 0 || !newName}
        >
          {t('changeName.save')}
        </Button>
      </form>
    </div>
  );
}
