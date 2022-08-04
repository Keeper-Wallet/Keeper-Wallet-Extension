import * as React from 'react';
import * as styles from './pills.styl';
import cn from 'classnames';

const _onClick =
  (cb: (...args: unknown[]) => unknown) => (id: number | undefined) =>
    cb && cb(id);

interface Props {
  className?: string;
  id?: number;
  text?: string;
  hidden?: boolean;
  selected?: boolean;
  onSelect: (...args: unknown[]) => unknown;
}

export function Pill({
  id,
  text,
  selected,
  hidden,
  className,
  onSelect,
}: Props) {
  const newClassName = cn(styles.pill, className, {
    [styles.selectedPill]: selected,
    [styles.hiddenPill]: hidden,
  });

  const onClick = _onClick(onSelect);
  return (
    <div className={newClassName}>
      <div>{text}</div>
      <div className={styles.text} onClick={() => onClick(id)}>
        {text}
      </div>
    </div>
  );
}
