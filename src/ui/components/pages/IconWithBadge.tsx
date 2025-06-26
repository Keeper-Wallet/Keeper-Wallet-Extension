import { type FC, type ReactNode } from 'react';

import * as styles from './styles/import.styl';

interface IconWithBadgeProps {
  icon: ReactNode;
  badge?: ReactNode;
  className?: string;
}

const IconWithBadge: FC<IconWithBadgeProps> = ({ icon, badge, className }) => (
  <span className={styles.iconWithBadge + (className ? ` ${className}` : '')}>
    {icon}
    {badge && <span className={styles.badge}>{badge}</span>}
  </span>
);

export { IconWithBadge };
export default IconWithBadge;
