import * as React from 'react';
import * as styles from './searchInput.module.css';
import { Button, BUTTON_TYPE, Input } from 'ui/components/ui';
import cn from 'classnames';

interface Props extends React.HTMLProps<HTMLInputElement> {
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
}

export function SearchInput({ value, onInput, onClear, ...restProps }: Props) {
  const inputRef = React.createRef<HTMLInputElement>();

  return (
    <div className={styles.searchInputWrapper}>
      <Input
        {...restProps}
        ref={inputRef}
        className={cn(styles.searchInput, 'font300')}
        onInput={onInput}
        value={value}
        spellCheck={false}
      />
      {typeof onClear === 'function' && value && (
        <Button
          className={styles.searchClear}
          type={BUTTON_TYPE.CUSTOM}
          onClick={() => {
            inputRef.current.focus();
            onClear();
          }}
          data-testid="searchClear"
        >
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path
              d="M10.1523 9L14.7614 4.39091C15.0795 4.07272 15.0795 3.55683 14.7614 3.23864C14.4432 2.92045 13.9273 2.92045 13.6091 3.23864L9 7.84773L4.39091 3.23864C4.07272 2.92045 3.55683 2.92045 3.23864 3.23864C2.92045 3.55683 2.92045 4.07272 3.23864 4.39091L7.84773 9L3.23864 13.6091C2.92045 13.9273 2.92045 14.4432 3.23864 14.7614C3.55683 15.0795 4.07272 15.0795 4.39091 14.7614L9 10.1523L13.6091 14.7614C13.9273 15.0795 14.4432 15.0795 14.7614 14.7614C15.0795 14.4432 15.0795 13.9273 14.7614 13.6091L10.1523 9Z"
              fill="currentColor"
            />
          </svg>
        </Button>
      )}
    </div>
  );
}
