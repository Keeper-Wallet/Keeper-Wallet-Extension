import clsx from 'clsx';

export function TxIcon({
  txType,
  small,
  className = '',
  children = null,
}: {
  txType: string;
  small?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  className = clsx(
    className,
    `${txType}-transaction-icon${small ? '-small' : ''}`
  );
  return <div className={className}>{children}</div>;
}
