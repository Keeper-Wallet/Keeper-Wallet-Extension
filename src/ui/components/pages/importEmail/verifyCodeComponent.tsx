import { createRef, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, ErrorMessage, Input } from '../../ui';
import * as styles from './verifyCodeComponent.module.css';

type VerifyCodeComponentProps = {
  className: string;
  isPending: boolean;
  codeLength?: number;
  onPendingChange(isPending: boolean): void;
  onApplyCode?(code: string): Promise<boolean>;
};

export function VerifyCodeComponent({
  className,
  codeLength = 6,
  onApplyCode,
  onPendingChange: onPending,
  isPending,
}: VerifyCodeComponentProps) {
  const { t } = useTranslation();
  const [isIncorrectCode, setIsIncorrectCode] = useState<boolean>(false);
  const refs = useMemo((): Array<React.RefObject<HTMLInputElement>> => {
    return new Array(codeLength).fill(undefined).map(() => createRef());
  }, [codeLength]);
  const [values, setValues] = useState<string[]>(refs.map(() => ''));

  useEffect(() => {
    if (values.length < codeLength || values.some(v => !v)) {
      return;
    }

    onPending(true);

    if (typeof onApplyCode === 'function') {
      const code = values.join('');

      onApplyCode(code)
        .then(result => {
          onPending(false);
          setIsIncorrectCode(!result);
        })
        .catch(() => {
          onPending(false);
          setIsIncorrectCode(true);
        })
        .then(() => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          refs[0].current!.focus();
          setValues(refs.map(() => ''));
        });
    } else {
      onPending(false);
    }
  }, [values, onApplyCode, refs, codeLength, onPending]);

  const changeHandler = useCallback(
    (value: string, index: number): void => {
      if (!value) {
        setValues(
          values.map((v, currentIndex) => (currentIndex === index ? '' : v)),
        );

        return;
      }

      const filledValues = value.split('');
      const newValues = values.map((v, currentIndex) => {
        if (currentIndex < index) {
          return v;
        }

        return filledValues[currentIndex - index] || v;
      });

      const nextIndex = Math.min(index + filledValues.length, codeLength - 1);
      const el =
        (refs[nextIndex] && refs[nextIndex].current) || refs[index].current;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      el!.focus();

      setValues(newValues);
    },
    [refs, values, codeLength],
  );

  const onFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  }, []);

  const onChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>): void => {
      const value = e.currentTarget.value;
      const index = Number(e.currentTarget.dataset.index);

      changeHandler(value, index);
    },
    [changeHandler],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      const keyCode = e.keyCode;
      const i = Number(e.currentTarget.dataset.index);
      const prevIndex = i - 1;
      const nextIndex = i + 1;
      const currentInput = refs[i] && refs[i].current;
      const prevInput = refs[prevIndex] ? refs[prevIndex].current : null;
      const nextInput = refs[nextIndex] ? refs[nextIndex].current : null;

      if (!currentInput) {
        return;
      }

      const KEY_CODE: Record<string, number> = {
        backspace: 8,
        left: 37,
        right: 39,
      };

      switch (keyCode) {
        case KEY_CODE.left: {
          e.preventDefault();
          if (prevInput) {
            prevInput.focus();
          }
          break;
        }
        case KEY_CODE.right: {
          e.preventDefault();
          if (nextInput) {
            nextInput.focus();
          }
          break;
        }
        case KEY_CODE.backspace: {
          e.preventDefault();
          if (currentInput.value) {
            changeHandler('', i);
          } else if (prevInput) {
            prevInput.focus();
            changeHandler('', prevIndex);
          }
          break;
        }
        default: {
          break;
        }
      }
    },
    [refs, changeHandler],
  );

  return (
    <div className={className}>
      <div className={styles.codeWrapper}>
        {refs.map((ref, i) => (
          <Input
            key={i}
            forwardRef={ref}
            className={styles.codeInput}
            value={values[i]}
            autoFocus={i === 0}
            onInput={onChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            data-index={i}
          />
        ))}
      </div>
      <div className={styles.codeErrorWrapper}>
        <ErrorMessage show={!isPending && isIncorrectCode}>
          {t('importEmail.incorrectCode')}
        </ErrorMessage>
        {isPending && (
          <Button
            className="center fullwidth"
            type="button"
            view="transparent"
            loading
          />
        )}
      </div>
    </div>
  );
}
