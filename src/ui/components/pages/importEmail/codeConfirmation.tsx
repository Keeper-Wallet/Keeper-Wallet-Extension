import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CodeDelivery } from '../../../../controllers/IdentityController';
import { VerifyCodeComponent } from './verifyCodeComponent';

type CodeConfirmationProps = {
  className?: string;
  codeDelivery: CodeDelivery | undefined;
  confirmCode(code: string): Promise<void>;
};

export function CodeConfirmation({
  className,
  codeDelivery,
  confirmCode,
}: CodeConfirmationProps) {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleConfirmCode = useCallback(
    async (code: string): Promise<boolean> => {
      try {
        await confirmCode(code);

        return true;
      } catch (e) {
        return false;
      }
    },
    [confirmCode],
  );

  const destination = codeDelivery?.destination;

  return (
    <form className={className}>
      <div className={clsx('margin1', 'tag1', 'basic500', 'input-title')}>
        {t('importEmail.verifyAccountDesc', { destination })}
      </div>

      <VerifyCodeComponent
        className="margin4"
        isPending={isPending}
        onPendingChange={setIsPending}
        onApplyCode={handleConfirmCode}
      />
    </form>
  );
}
