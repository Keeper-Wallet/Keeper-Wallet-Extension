/**
 * Environment configuration module
 * Provides centralized access to environment variables
 */

/**
 * Get the data service URL based on DATA_SERVICE_ENV
 * Default (Production): https://api.keeper-wallet.app
 * Local development: http://127.0.0.1:8000 (when DATA_SERVICE_ENV=local)
 */
export function getDataServiceUrl(): string {
  const dataServiceEnv = process.env.DATA_SERVICE_ENV || 'prod';

  // Use localhost for development
  if (dataServiceEnv === 'local') {
    return 'http://127.0.0.1:8000';
  }

  // Default to production URL
  return 'https://api.keeper-wallet.app';
}

/**
 * Get the swap service URL
 * Currently hardcoded to production, can be made configurable if needed
 */
export function getSwapServiceUrl(): string {
  return 'https://swap-api.keeper-wallet.app';
}
