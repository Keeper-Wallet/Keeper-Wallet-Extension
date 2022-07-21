import * as React from 'react';
import styles from './Input.module.css';
import cn from 'classnames';

type View = 'default' | 'password';

interface Props {
  wrapperClassName?: string;
  className?: string;
  error?: boolean;
  multiLine?: boolean;
  view?: View;
  type?: string;
  forwardRef?: React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement>;
}

export type InputProps = Props &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;

export type TextareaProps = Props &
  React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >;

export function Input({
  wrapperClassName,
  className,
  error,
  multiLine,
  view = 'default',
  type,
  forwardRef,
  ...props
}: InputProps | TextareaProps) {
  const [rootType, setRootType] = React.useState(type);

  const rootRef = React.useRef<HTMLInputElement | HTMLTextAreaElement | null>(
    null
  );
  const getRef = React.useCallback(
    (element: HTMLInputElement | HTMLTextAreaElement) => {
      forwardRef && (forwardRef.current = element);
      rootRef.current = element;
    },
    [forwardRef]
  );

  return (
    <div
      className={cn(styles.wrapper, wrapperClassName, {
        [styles.error]: error,
        [styles.checkbox]: type === 'checkbox',
        [styles.password]: view === 'password',
      })}
    >
      {multiLine ? (
        <textarea
          className={cn(styles.input, className)}
          {...(props as TextareaProps)}
          ref={getRef}
        />
      ) : (
        <>
          <input
            className={cn(styles.input, className)}
            {...(props as InputProps)}
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
