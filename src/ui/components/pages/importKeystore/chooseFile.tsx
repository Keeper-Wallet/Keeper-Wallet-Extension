import styles from './chooseFile.styl';
import cn from 'classnames';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Error, Input } from '../../ui';

interface Props {
  title: string;
  label: string;
  placeholder: string;
  loading?: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  onSubmit: (result: string, password?: string) => void;
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
  const [keystoreFile, setKeystoreFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState('');

  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState('');

  React.useEffect(() => {
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
              (text: string) => !!JSON.parse(decodeURIComponent(atob(text)))
            )
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
        onSubmit(result, showPassword ? password : undefined);
      }}
    >
      <h2 className={'title1 margin3 left'}>{title}</h2>
      <p className={'tag1 basic500 input-title'}>{label}</p>

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
          {t('importKeystore.browse')}
        </span>

        <span
          className={cn('body1', styles.keystoreFileName)}
          title={keystoreFile ? keystoreFile.name : undefined}
        >
          {keystoreFile
            ? keystoreFile.name
            : t('importKeystore.noFileSelected')}
        </span>
      </label>

      {showPassword && (
        <>
          <div className={'tag1 basic500 input-title'}>
            {t('importKeystore.passwordLabel')}
          </div>
          <Input
            wrapperClassName="margin1"
            data-testid="passwordInput"
            placeholder={placeholder}
            type="password"
            view="password"
            value={password}
            onChange={event => {
              setPassword(event.currentTarget.value);
            }}
          />
        </>
      )}

      {error && <Error show>{error}</Error>}

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
