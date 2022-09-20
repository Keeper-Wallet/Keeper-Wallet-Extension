import { PreferencesAccount } from 'preferences/types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { changeAccountName } from '../../actions/account';
import { CONFIG } from '../../appConfig';
import { Button, Error, Input } from '../ui';
import * as styles from './styles/changeName.styl';

function validateName(name: string, accounts: PreferencesAccount[]) {
  const errors: Array<{ code: number; key: string; msg: string }> = [];
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
  const navigate = useNavigate();
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.accounts);

  const account = useAppSelector(state => {
    const selected = state.localState.assets.account
      ? state.localState.assets.account.address
      : state.selectedAccount.address;

    return state.accounts.find(x => x.address === selected);
  });

  const [error, setError] = React.useState(false);

  const [errors, setErrors] = React.useState<ReturnType<typeof validateName>>(
    []
  );

  const [newName, setNewName] = React.useState('');

  return (
    <div className={styles.content}>
      <h2 className={`title1 margin3 left`}>{t('changeName.title')}</h2>

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
        onSubmit={event => {
          event.preventDefault();

          dispatch(
            changeAccountName({
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              address: account!.address,
              name: newName,
            })
          );

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
              const errors = validateName(newName, accounts);

              setErrors(errors);
              setError(errors.length !== 0);
            }}
            onChange={event => {
              const newName = event.currentTarget.value;

              setNewName(newName);
              setError(false);
              setErrors(validateName(newName, accounts));
            }}
          />

          <Error
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
