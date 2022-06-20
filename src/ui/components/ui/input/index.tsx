import * as React from 'react';
import * as styles from './Input.module.css';
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

export const Input: React.FC<InputProps | TextareaProps> = ({
  wrapperClassName,
  className,
  error,
  multiLine,
  view = 'default',
  type,
  forwardRef,
  ...props
}) => {
  className = cn(styles.input, className, {
    [styles.error]: error,
    [styles.checkbox]: type === 'checkbox',
    [styles.password]: view === 'password',
  });

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

  return multiLine ? (
    <textarea
      className={cn(wrapperClassName, className)}
      {...(props as TextareaProps)}
      ref={getRef}
    />
  ) : (
    <div className={cn(wrapperClassName, 'relative')}>
      <input
        className={className}
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
    </div>
  );
};
