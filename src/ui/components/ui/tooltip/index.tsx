import { type Placement } from '@popperjs/core';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as Popper from 'react-popper';

import * as modal from '../modal/modal.styl';
import * as styles from './tooltip.module.css';

interface Props {
  className?: string;
  children: (renderProps: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: React.MutableRefObject<any>;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  }) => React.ReactNode;
  content: React.ReactNode;
  placement?: Placement;
}

export function Tooltip({
  className = '',
  children,
  content,
  placement = 'top-end',
  ...props
}: Props) {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const elRef = useRef(null);
  const popperRef = useRef(null);
  const [arrowRef, setArrowRef] = useState<HTMLElement | null>(null);
  const { styles: stylesP, attributes: attributesP } = Popper.usePopper(
    elRef.current,
    popperRef.current,
    {
      placement,
      modifiers: [
        {
          name: 'arrow',
          options: {
            element: arrowRef,
          },
        },
        {
          name: 'offset',
          options: {
            offset: [0, 10],
          },
        },
      ],
    }
  );
  const [showPopper, setShowPopper] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const root = document.getElementById('app-modal')!;

    const child = document.createElement('div');
    child.classList.add(modal.modalWrapper);
    root.appendChild(child);
    setEl(child);

    return () => {
      root.removeChild(child);
    };
  }, []);

  return (
    <>
      {children({
        ref: elRef,
        onMouseEnter: () => setShowPopper(true),
        onMouseLeave: () => setShowPopper(false),
      })}

      {el &&
        createPortal(
          showPopper && (
            <div
              ref={popperRef}
              className={clsx(className, styles.tooltip)}
              style={stylesP.popper}
              {...attributesP.popper}
              {...props}
            >
              <div
                ref={setArrowRef}
                className={styles.arrow}
                style={stylesP.arrow}
              />
              {content}
            </div>
          ),
          el
        )}
    </>
  );
}
