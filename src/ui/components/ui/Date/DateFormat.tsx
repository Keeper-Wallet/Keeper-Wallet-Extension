import { useTranslation } from 'react-i18next';

import * as styles from './DateFormat.module.css';

const DEFAULT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: 'numeric',
  minute: 'numeric',
};
interface Props {
  className?: string;
  date: number | Date;
  options?: Intl.DateTimeFormatOptions;
  showRaw?: boolean;
}

export const DateFormat = ({
  className,
  date,
  options = DEFAULT_OPTIONS,
  showRaw,
}: Props) => {
  const { i18n } = useTranslation();

  return (
    <div className={className}>
      <span>
        {new Intl.DateTimeFormat(i18n.language, options).format(new Date(date))}
      </span>{' '}
      {showRaw ? <span className={styles.timestamp}>{date}</span> : undefined}
    </div>
  );
};
