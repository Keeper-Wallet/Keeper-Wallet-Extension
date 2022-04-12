export const KEEPERWALLET_DEBUG = process.env.NODE_ENV !== 'production';

export const CONFIG = {
  SEED_MIN_LENGTH: 24,
  NAME_MIN_LENGTH: 1,
  PASSWORD_MIN_LENGTH: 8,
  MESSAGES_CONFIRM_TIMEOUT: 2000,
  BASE_URL: 'https://waves.exchange',
};

export const I18N_NAME_SPACE = 'extension';
