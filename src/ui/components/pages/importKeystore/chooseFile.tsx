import * as styles from './chooseFile.styl';
import cn from 'classnames';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Error, Input } from '../../ui';

interface Props {
  error: string | null;
  onSubmit: (file: File, password: string) => void;
}

export function ImportKeystoreChooseFile({ error, onSubmit }: Props) {
  const { t } = useTranslation();
  const [keystoreFile, setKeystoreFile] = React.useState<File | null>(null);
  const [password, setPassword] = React.useState('');

  return (
    <form
      className={styles.root}
      onSubmit={event => {
        event.preventDefault();
        onSubmit(keystoreFile, password);
      }}
    >
      <h2 className={'title1 margin3 left'}>
        <Trans i18nKey="importKeystore.chooseFileTitle" />
      </h2>

      <div className={'tag1 basic500 input-title'}>
        <Trans i18nKey="importKeystore.keystoreLabel" />
      </div>

      <label className={cn(styles.keystoreFile, 'margin1')}>
        <span className={styles.keystoreFileButton}>
          <input
            accept="application/json"
            className={styles.keystoreFileInput}
            data-testid="fileInput"
            type="file"
            value=""
            onChange={event => {
              setKeystoreFile(event.currentTarget.files[0] || null);
            }}
          />
          <Trans i18nKey="importKeystore.browse" />
        </span>

        <span
          className={cn('body1', styles.keystoreFileName)}
          title={keystoreFile ? keystoreFile.name : undefined}
        >
          {keystoreFile ? (
            keystoreFile.name
          ) : (
            <Trans i18nKey="importKeystore.noFileSelected" />
          )}
        </span>
      </label>

      <div className={'tag1 basic500 input-title'}>
        <Trans i18nKey="importKeystore.passwordLabel" />
      </div>

      <Input
        className="margin4"
        data-testid="passwordInput"
        placeholder={t('importKeystore.passwordPlaceholder')}
        type="password"
        value={password}
        onChange={event => {
          setPassword(event.currentTarget.value);
        }}
      />

      {error && (
        <Error className="margin4" show>
          {error}
        </Error>
      )}

      <Button
        data-testid="submitButton"
        disabled={keystoreFile == null || !password}
        type="submit"
        view="submit"
      >
        <Trans i18nKey="importKeystore.chooseFileSubmitBtn" />
      </Button>
    </form>
  );
}
