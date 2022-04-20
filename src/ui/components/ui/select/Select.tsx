import cn from 'classnames';
import * as React from 'react';
import * as styles from './index.styl';

type TText = string | React.ReactNode;

interface SelectItem<T> {
  id: string | number;
  text: TText;
  value: T;
}

type ListPlacement = 'top' | 'bottom';

interface Props<T> {
  className?: string;
  description?: TText;
  forwardRef?: React.MutableRefObject<HTMLDivElement>;
  listPlacement?: ListPlacement;
  selected?: string | number;
  selectList: Array<SelectItem<T>>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onSelectItem: (id: string | number, value: T) => void;
}

export function Select<T>({
  className,
  description,
  forwardRef,
  listPlacement = 'bottom',
  selected,
  selectList,
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
    <div className={cn(className, styles.select)} ref={getRef}>
      {description ? (
        <div className="left input-title basic500 tag1">{description}</div>
      ) : null}

      <div
        className={cn(styles.selectInput, 'cant-select')}
        onClick={() => {
          setIsOpen(prevState => !prevState);
        }}
        {...otherProps}
      >
        <div className={styles.listItemSelected}>{selectedItem.text}</div>
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
                className={styles.listItem}
                onClick={() => {
                  setIsOpen(false);
                  onSelectItem(item.id, item.value);
                }}
              >
                {item.text}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
