import * as React from 'react';
import { VerifyCodeComponent } from './verifyCodeComponent';
import { Trans } from 'react-i18next';
import cn from 'classnames';
import { CodeDelivery } from '../../../../controllers/IdentityController';

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
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const handleConfirmCode = React.useCallback(
    async (code: string): Promise<boolean> => {
      try {
        await confirmCode(code);

        return true;
      } catch (e) {
        return false;
      }
    },
    [confirmCode]
  );

  const destination = codeDelivery?.destination;

  return (
    <form className={className}>
      <div className={cn('margin1', 'tag1', 'basic500', 'input-title')}>
        <Trans
          i18nKey="importEmail.verifyAccountDesc"
          values={{ destination }}
        />
      </div>

      <VerifyCodeComponent
        className="margin4"
        isPending={isPending}
        isCodeSent={Boolean(codeDelivery)}
        onPendingChange={setIsPending}
        onApplyCode={handleConfirmCode}
      />
    </form>
  );
}
