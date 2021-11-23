import * as React from 'react';
import { Trans } from 'react-i18next';
import { Input } from '../ui/input';
import { Button } from '../ui/buttons/Button';
import * as styles from './send.module.css';
import { Select } from '../ui/select/Select';

export function Send() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <Trans i18nKey="send.title" />
        </h1>
      </header>

      <div className={styles.form}>
        <div className="input-title basic500 tag1">
          <Trans i18nKey="send.recipientInputLabel" />
        </div>

        <div className="margin-main-big">
          <Input autoComplete="off" autoFocus />
        </div>

        <div className="input-title basic500 tag1">
          <Trans i18nKey="send.assetInputLabel" />
        </div>

        <div className="margin-main-big">
          <Select
            className="fullwidth"
            selectList={[{ id: 'WAVES', text: 'WAVES', value: 'WAVES' }]}
            selected="WAVES"
          />
        </div>

        <div className="input-title basic500 tag1">
          <Trans i18nKey="send.amountInputLabel" />
        </div>

        <div className="margin-main-big">
          <Input autoComplete="off" />
        </div>
      </div>

      <div className={styles.submitButtonWrapper}>
        <Button className="fullwidth" type="submit">
          <Trans i18nKey="send.submitButtonText" />
        </Button>
      </div>
    </div>
  );
}
