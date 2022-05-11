import { Account } from 'accounts/types';
import { AssetDetail } from 'ui/services/Background';
import { BalanceAssets } from 'ui/components/transactions/BaseTransaction/TxInfo';
import { WithTranslation } from 'react-i18next';

export * from './TxIcon';
export * from './TxDetailTabs';
export * from './TxFooter';
export * from './TxStatus';
export * from './TxHeader';
export * from './TxInfo';

interface MessageDataData {
  id: unknown;
  icon: string;
  name: unknown;

  orderType?: 'sell' | 'buy';
  expiration?: number;
  matcherPublicKey: string;

  dApp?: string;
  call?: {
    function: string;
    args: Array<{ type: string; value: unknown }>;
  };
  payment: unknown[];

  script?: string;

  recipient?: string;
  attachment?: string;
}

export interface MessageData {
  type: number;
  data: MessageDataData;
  referrer?: string | URL;
  binary?: string;
}

export interface Message {
  type: string;
  data: MessageData;
  origin?: string;
  account?: Account;
  messageHash?: string;
  lease?: unknown;
  broadcast?: boolean;
}

export interface ComponentProps extends WithTranslation {
  className?: string;
  message: Message;
  assets: Record<string, AssetDetail>;
  autoClickProtection?: boolean;
  collapsed?: boolean;
  sponsoredBalance?: BalanceAssets;

  approve: (...args: unknown[]) => void;
  reject: (...args: unknown[]) => void;
}
