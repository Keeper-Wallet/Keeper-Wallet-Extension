import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal } from '../../ui/components/ui';
import { Copy } from '../../ui/components/ui/copy';
import * as styles from './expandable.module.css';

export function Expandable({
  allowExpanding,
  children,
  textToCopy,
}: {
  allowExpanding: boolean;
  children: React.ReactNode;
  textToCopy: string | undefined;
}) {
  const { t } = useTranslation();

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isExpandable, setIsExpandable] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);

  useEffect(() => {
    const contentEl = contentRef.current;

    if (isExpandable || !contentEl) return;

    setIsExpandable(contentEl.scrollHeight > contentEl.clientHeight);
  }, [isExpandable]);

  useEffect(() => {
    if (!showCopiedNotification) return;

    const timeout = setTimeout(() => {
      setShowCopiedNotification(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [showCopiedNotification]);

  return (
    <div
      className={clsx(styles.expandable, {
        [styles.expandable_isExpanded]: isExpanded,
      })}
    >
      <div ref={contentRef} className={styles.expandableContent}>
        {children}
      </div>

      <div className={styles.buttonsWrapper}>
        <Copy
          text={textToCopy}
          onCopy={() => {
            setShowCopiedNotification(true);
          }}
        >
          <button className={styles.button} type="button">
            {t('showScriptComponent.copyCode')}
          </button>
        </Copy>

        {allowExpanding && isExpandable && (
          <button
            className={styles.button}
            type="button"
            onClick={() => {
              setIsExpanded(prevState => !prevState);
            }}
          >
            {!isExpanded
              ? t('showScriptComponent.showAll')
              : t('showScriptComponent.hide')}
          </button>
        )}
      </div>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={showCopiedNotification}
      >
        <div className="modal notification">
          {t('showScriptComponent.copied')}
        </div>
      </Modal>
    </div>
  );
}
