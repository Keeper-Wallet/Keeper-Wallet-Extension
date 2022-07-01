import cn from 'classnames';
import * as React from 'react';
import * as styles from './Select.module.css';

type TText = string | React.ReactNode;

interface SelectItem<T> {
  id: string | number;
  text: TText;
  value: T;
  icon?: React.ReactNode;
}

type ListPlacement = 'top' | 'bottom';
type Theme = 'compact' | 'solid' | 'underlined';

const themeClassNames: Record<Theme, string> = {
  compact: styles.theme_compact,
  solid: styles.theme_solid,
  underlined: styles.theme_underlined,
};

interface Props<T> {
  className?: string;
  description?: TText;
  fill?: boolean;
  forwardRef?: React.MutableRefObject<HTMLDivElement>;
  listPlacement?: ListPlacement;
  selectList: Array<SelectItem<T>>;
  selected?: string | number;
  theme?: Theme;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onSelectItem: (id: string | number, value: T) => void;
}

export function Select<T>({
  className,
  description,
  fill,
  forwardRef,
  listPlacement = 'bottom',
  selected,
  selectList,
  theme = 'solid',
  onSelectItem,
  ...otherProps
}: Props<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleDocumentClick(event: MouseEvent) {
      if (
        event.target instanceof HTMLElement &&
        rootRef.current.contains(event.target)
      ) {
        return;
      }

      setIsOpen(false);
    }

    document.addEventListener('click', handleDocumentClick, {
      capture: true,
    });

    return () => {
      document.removeEventListener('click', handleDocumentClick, {
        capture: true,
      });
    };
  }, [isOpen]);

  const getRef = React.useCallback(
    (element: HTMLDivElement) => {
      forwardRef && (forwardRef.current = element);
      rootRef.current = element;
    },
    [forwardRef]
  );

  const selectedItem =
    selectList.find(({ id }) => id === selected) || selectList[0];

  return (
    <div
      className={cn(className, styles.root, themeClassNames[theme], {
        [styles.root_fill]: fill,
      })}
      ref={getRef}
    >
      {description ? (
        <div className="left input-title basic500 tag1">{description}</div>
      ) : null}

      <div
        className={styles.trigger}
        onClick={() => {
          setIsOpen(prevState => !prevState);
        }}
        {...otherProps}
      >
        {selectedItem.icon}
        <div className={styles.triggerText}>{selectedItem.text}</div>
      </div>

      {isOpen && (
        <div
          className={cn(
            styles.list,
            {
              bottom: styles.list_placement_bottom,
              top: styles.list_placement_top,
            }[listPlacement]
          )}
        >
          {selectList
            .filter(item => item.id !== selected)
            .map(item => (
              <div
                key={item.id}
                className={styles.item}
                onClick={() => {
                  setIsOpen(false);
                  onSelectItem(item.id, item.value);
                }}
              >
                {item.text}
                {item.icon}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
