import './head.styl';

import cn from 'classnames';

export function HeadLogo({
  className = '',
  children = null,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const newClassName = cn(className, 'logo');
  return (
    <div className={newClassName} {...props}>
      {children}
    </div>
  );
}
