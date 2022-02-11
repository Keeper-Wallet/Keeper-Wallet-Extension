import { seedUtils } from '@waves/waves-transactions';
import cn from 'classnames';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { clearSeedErrors, newAccountSelect } from '../../actions';
import { Button, Error, Input } from '../ui';
import { PAGES } from '../../pageConfig';
import * as styles from './importSeed.module.css';

interface Props {
  isNew?: boolean;
  setTab: (newTab: string) => void;
}

export function ImportSeed({ isNew, setTab }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const account = useAppSelector(state => state.localState.newAccount);
  const accounts = useAppSelector(state => state.accounts);
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const customCodes = useAppSelector(state => state.customCodes);
  const networks = useAppSelector(state => state.networks);

  const [showError, setShowError] = React.useState(false);
  const [showExistError, setShowExistError] = React.useState(false);
  const [seedValue, setSeedValue] = React.useState(isNew ? '' : account.seed);

  const seedObj = React.useMemo(() => {
    if (seedValue.length < 24) {
      return null;
    }

    const networkCode =
      customCodes[currentNetwork] ||
      networks.find(({ name }) => currentNetwork === name).code ||
      '';

    return new seedUtils.Seed(seedValue.trim(), networkCode);
  }, [currentNetwork, customCodes, networks, seedValue]);

  const seedExists = seedObj
    ? accounts.some(acc => acc.address === seedObj.address)
    : false;

  return (
    <div className={styles.content}>
      <div>
        <h2 className="title1 margin3 left">
          <Trans i18nKey="importSeed.title" />
        </h2>
      </div>

      <form
        onSubmit={event => {
          event.preventDefault();

          if (seedExists) {
            setShowExistError(true);
            return;
          }

          setShowExistError(false);

          dispatch(
            newAccountSelect({
              address: seedObj ? seedObj.address : '',
              seed: seedObj ? seedObj.phrase : '',
              type: 'seed',
              name: '',
              hasBackup: true,
            })
          );

          dispatch(clearSeedErrors());
          setTab(PAGES.ACCOUNT_NAME_SEED);
        }}
      >
        <div className="tag1 basic500 input-title">
          <Trans i18nKey="importSeed.newSeed" />
        </div>

        <Input
          autoFocus
          error={(!seedObj || seedExists) && showError}
          multiLine
          placeholder={t('importSeed.inputSeed')}
          rows={3}
          spellCheck={false}
          value={seedValue}
          onBlur={() => {
            setShowError(true);
          }}
          onFocus={() => {
            setShowError(false);
          }}
          onChange={event => {
            setSeedValue(event.target.value);
          }}
        />

        <Error show={showExistError} className={styles.error}>
          <Trans i18nKey="importSeed.existError" />
        </Error>

        <div className="tag1 basic500 input-title">
          <Trans i18nKey="importSeed.address" />
        </div>

        <div className={cn(styles.greyLine, 'grey-line')}>
          {seedObj?.address}
        </div>

        <Button id="importAccount" type="submit" disabled={!seedObj}>
          <Trans i18nKey="importSeed.importAccount" />
        </Button>
      </form>
    </div>
  );
}
