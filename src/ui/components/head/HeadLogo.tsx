import './head.styl';

import clsx from 'clsx';

export function HeadLogo({
  className = '',
  children = null,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const newClassName = clsx(className, 'logo');
  return (
    <div className={newClassName} {...props}>
      {children}
    </div>
  );
}
