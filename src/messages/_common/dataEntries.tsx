import { type DataTransactionEntry } from '@waves/ts-types';
import { useTranslation } from 'react-i18next';

import * as styles from './dataEntries.module.css';

interface Props {
  entries: DataTransactionEntry[];
}

export function DataEntries({ entries }: Props) {
  const { t } = useTranslation();

  return (
    <table className={styles.root}>
      <thead>
        <tr className="basic500">
          <td>{t('showScriptComponent.key')}</td>
          <td>{t('showScriptComponent.type')}</td>
          <td>{t('showScriptComponent.value')}</td>
        </tr>
      </thead>

      <tbody>
        {entries.map((entry, index) => (
          <tr key={index} data-testid="dataRow">
            <td data-testid="dataRowKey" title={entry.key}>
              {entry.key}
            </td>

            <td data-testid="dataRowType" title={entry.type ?? undefined}>
              {entry.type}
            </td>

            <td data-testid="dataRowValue" title={String(entry.value)}>
              {entry.type == null ? 'Key Deletion' : String(entry.value)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
