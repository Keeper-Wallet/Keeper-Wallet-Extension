import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Background from '../services/Background';

/**
 * Custom hook for wallet name validation
 * Integrates with the WalletValidationService for real-time validation
 */
export function useWalletValidation() {
  const { t } = useTranslation();

  /**
   * Validate wallet name with comprehensive business rules
   */
  const validateWalletName = useCallback(
    async (
      name: string,
    ): Promise<{
      isValid: boolean;
      error?: string;
    }> => {
      // Basic length validation (immediate)
      if (!name || name.trim().length === 0) {
        return {
          isValid: false,
          error: t('newAccountName.errorRequired'),
        };
      }

      if (name.length > 32) {
        return {
          isValid: false,
          error: 'Wallet name cannot exceed 32 characters',
        };
      }

      try {
        // Use Background service to check for existing wallets
        const existingWallets = await Background.getMultiWallets();
        const nameExists = existingWallets.some(wallet => wallet.name === name);

        if (nameExists) {
          return {
            isValid: false,
            error: t('newAccountName.errorInUse'),
          };
        }

        return { isValid: true };
      } catch (error) {
        console.error('Wallet name validation error:', error);
        return {
          isValid: false,
          error: 'Validation error occurred',
        };
      }
    },
    [t],
  );

  return useMemo(
    () => ({
      validateWalletName,
    }),
    [validateWalletName],
  );
}
