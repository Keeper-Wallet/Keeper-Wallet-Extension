import clsx from 'clsx';

interface Props {
  className?: string;
  small?: boolean;
  type: string;
}

export function MessageIcon({ className, small, type }: Props) {
  return (
    <div
      className={clsx(
        className,
        `${type}-transaction-icon${small ? '-small' : ''}`,
      )}
    />
  );
}
