import * as styles from './Backdrop.module.css';
import * as React from 'react';

function isClickOnScrollBar(e: MouseEvent | TouchEvent) {
  const target = e.target as Element;

  if (!target) {
    return false;
  }

  if (MouseEvent && e instanceof MouseEvent) {
    const targetWidthWithoutScrollBar = target.clientWidth;
    const clickXPos = e.offsetX;

    if (targetWidthWithoutScrollBar < clickXPos) {
      return true;
    }
  }

  return false;
}

interface Props {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}

function BackdropComponent(
  { onClick, className, children }: Props,
  ref: React.Ref<HTMLDivElement>
) {
  // click is broken on iPhone
  const touchEvent = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
  const touchCaptureProp =
    'ontouchstart' in window ? 'onTouchStartCapture' : 'onMouseDownCapture';

  const isClickedInside = React.useRef(false);

  React.useLayoutEffect(() => {
    function handleDocumentClick(e: MouseEvent | TouchEvent) {
      if (isClickedInside.current || isClickOnScrollBar(e)) {
        isClickedInside.current = false;
      } else {
        onClick();
      }
    }

    document.addEventListener(touchEvent, handleDocumentClick);
    return () => {
      document.removeEventListener(touchEvent, handleDocumentClick);
    };
  }, [onClick, touchEvent]);

  return (
    <div
      ref={ref}
      className={`${styles.backdrop} ${className}`}
      {...{
        [touchCaptureProp]: () => {
          isClickedInside.current = true;
        },
      }}
    >
      {children}
    </div>
  );
}

export const Backdrop = React.forwardRef(BackdropComponent);
