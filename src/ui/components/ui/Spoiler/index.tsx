import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../';
import * as styles from './Spoiler.module.css';

interface Props {
  className?: string;
  title?: string;
  count?: number;
  expanded?: boolean;
  children?: React.ReactNode;
}

export function Spoiler({
  className,
  title,
  count,
  expanded,
  children,
}: Props) {
  const { t } = useTranslation();

  const [showContent, setShowContent] = useState(!!expanded);

  return (
    <div className={className}>
      <Button
        className={`${styles.button} ${showContent && styles.expandedButton}`}
        onClick={() => {
          setShowContent(!showContent);
        }}
      >
        {count && <p className={styles.count}>{count}</p>}
        {title && <p className={styles.title}>{title}</p>}
        <p className={styles.text}>
          {t(showContent ? 'spoiler.hide' : 'spoiler.view')}
        </p>
      </Button>
      {showContent && <div className={styles.content}>{children}</div>}
    </div>
  );
}
