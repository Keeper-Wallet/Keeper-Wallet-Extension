import * as React from 'react';
import * as Popper from 'react-popper';
import * as modal from '../modal/modal.styl';
import * as ReactDOM from 'react-dom';
import * as styles from './tooltip.module.css';
import { Placement } from '@popperjs/core';
import cn from 'classnames';

interface Props {
  className?: string;
  children: (renderProps: {
    ref: React.MutableRefObject<any>;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  }) => React.ReactChild;
  content: any;
  placement?: Placement;
}

export function Tooltip({
  className = '',
  children,
  content,
  placement = 'top-end',
}: Props) {
  const [el, setEl] = React.useState<HTMLDivElement>(null);
  const elRef = React.useRef(null);
  const popperRef = React.useRef(null);
  const [arrowRef, setArrowRef] = React.useState(null);
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
  const [showPopper, setShowPopper] = React.useState(false);

  React.useEffect(() => {
    const root = document.getElementById('app-modal');

    const child = document.createElement('div');
    child.classList.add(modal.modalWrapper);
    root.appendChild(child);
    setEl(child);

    return () => root.removeChild(child);
  }, []);

  return (
    <>
      {children({
        ref: elRef,
        onMouseEnter: () => setShowPopper(true),
        onMouseLeave: () => setShowPopper(false),
      })}

      {el &&
        ReactDOM.createPortal(
          showPopper && (
            <div
              ref={popperRef}
              className={cn(className, styles.tooltip)}
              style={stylesP.popper}
              {...attributesP.popper}
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
