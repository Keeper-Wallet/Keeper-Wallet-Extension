import clsx from 'clsx';
import { useCallback, useRef, useState } from 'react';

import * as styles from './Input.module.css';

type View = 'default' | 'password';

interface InputEvents<E extends HTMLTextAreaElement | HTMLInputElement> {
  onBlur?: (event: React.FocusEvent<E>) => void;
  onChange?: (event: React.ChangeEvent<E>) => void;
  onFocus?: (event: React.FocusEvent<E>) => void;
  onKeyDown?: (event: React.KeyboardEvent<E>) => void;
  onInput?: (event: React.FormEvent<E>) => void;
  onScroll?: (event: React.UIEvent<E>) => void;
}

export type InputProps = {
  autoComplete?: string;
  autoFocus?: boolean;
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  error?: unknown;
  forwardRef?: React.MutableRefObject<
    HTMLInputElement | HTMLTextAreaElement | null
  >;
  id?: string;
  maxLength?: number;
  placeholder?: string;
  spellCheck?: boolean;
  type?: React.HTMLInputTypeAttribute;
  value?: string | readonly string[] | number;
  view?: View;
  wrapperClassName?: string;
} & (
  | ({ multiLine: true; rows?: number } & InputEvents<HTMLTextAreaElement>)
  | ({ multiLine?: false | undefined } & InputEvents<HTMLInputElement>)
);

export function Input({
  wrapperClassName,
  className,
  error,
  multiLine,
  view = 'default',
  type,
  forwardRef,
  ...props
}: InputProps) {
  const [rootType, setRootType] = useState(type);

  const rootRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const getRef = useCallback(
    (element: HTMLInputElement | HTMLTextAreaElement | null) => {
      forwardRef && (forwardRef.current = element);
      rootRef.current = element;
    },
    [forwardRef],
  );

  return (
    <div
      className={clsx(styles.wrapper, wrapperClassName, {
        [styles.error]: error,
        [styles.checkbox]: type === 'checkbox',
        [styles.password]: view === 'password',
      })}
    >
      {multiLine ? (
        <textarea
          className={clsx(styles.input, className)}
          {...(props as Extract<InputProps, { multiLine: true }>)}
          ref={getRef}
        />
      ) : (
        <>
          <input
            className={clsx(styles.input, className)}
            {...(props as Extract<InputProps, { multiLine?: false }>)}
            type={rootType}
            ref={getRef}
          />
          {view === 'password' && (
            <i
              className={styles.passwordIcon}
              onClick={() => {
                setRootType(rootType === 'password' ? 'text' : 'password');
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
