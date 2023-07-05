import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, ErrorMessage, Input } from '../../ui';
import * as styles from './chooseFile.styl';

interface Props {
  title: string;
  label: string;
  placeholder: string;
  loading?: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  onSubmit: (result: string, password: string) => void;
}

export function ImportKeystoreChooseFile({
  title,
  label,
  placeholder,
  loading,
  error,
  setError,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const [keystoreFile, setKeystoreFile] = useState<File | null>(null);
  const [result, setResult] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    setError('');

    if (!keystoreFile) {
      return;
    }

    try {
      const reader = new FileReader();

      reader.onerror = () => {
        setError(t('importKeystore.errorFormat'));
      };
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          setError(t('importKeystore.errorFormat'));
          return;
        }

        try {
          setShowPassword(
            !Object.values(JSON.parse(reader.result)).every(
              text => !!JSON.parse(decodeURIComponent(atob(text as string))),
            ),
          );
        } catch {
          setShowPassword(true);
        }

        setResult(reader.result);
      };

      reader.readAsText(keystoreFile);
    } catch (err) {
      setError(t('importKeystore.errorFormat'));
    }
  }, [keystoreFile, setError, t]);

  return (
    <form
      className={styles.root}
      onSubmit={event => {
        event.preventDefault();
        onSubmit(result, showPassword ? password : '');
      }}
    >
      <h2 className="title1 margin3 left">{title}</h2>
      <p className="tag1 basic500 input-title">{label}</p>

      <label className={clsx(styles.keystoreFile, 'margin1')}>
        <span className={styles.keystoreFileButton}>
          <input
            accept="application/json"
            className={styles.keystoreFileInput}
            data-testid="fileInput"
            type="file"
            value=""
            onChange={event => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              setKeystoreFile(event.currentTarget.files![0] || null);
            }}
          />
          {t('importKeystore.browse')}
        </span>

        <span
          className={clsx('body1', styles.keystoreFileName)}
          title={keystoreFile ? keystoreFile.name : undefined}
        >
          {keystoreFile
            ? keystoreFile.name
            : t('importKeystore.noFileSelected')}
        </span>
      </label>

      {showPassword && (
        <>
          <div className="tag1 basic500 input-title">
            {t('importKeystore.passwordLabel')}
          </div>
          <Input
            autoComplete="current-password"
            data-testid="passwordInput"
            placeholder={placeholder}
            type="password"
            value={password}
            view="password"
            wrapperClassName="margin1"
            onChange={event => {
              setPassword(event.currentTarget.value);
            }}
          />
        </>
      )}

      {error && <ErrorMessage show>{error}</ErrorMessage>}

      <Button
        className={styles.keystoreButton}
        data-testid="submitButton"
        disabled={
          loading || keystoreFile == null || (showPassword && !password)
        }
        loading={loading}
        type="submit"
        view="submit"
      >
        {t('importKeystore.chooseFileSubmitBtn')}
      </Button>
    </form>
  );
}
