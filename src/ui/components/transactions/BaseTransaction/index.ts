import { Account } from 'accounts/types';
import { AssetDetail } from 'ui/services/Background';
import { WithTranslation } from 'react-i18next';

export * from './TxIcon';
export * from './TxDetailTabs';
export * from './TxFooter';
export * from './TxStatus';
export * from './TxHeader';
export * from './TxInfo';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MessageDataData = any;

export interface MessageData {
  type: number;
  data: MessageDataData;
  referrer?: string | URL;
  binary?: string;
  timestamp?: number;
  publicKey?: string;
}

export interface Message {
  id?: string;
  type: string;
  data: MessageData;
  origin?: string;
  account?: Account;
  messageHash?: string;
  lease?: unknown;
  broadcast?: boolean;
  title?: string;
  json?: string;
}

export interface ComponentProps extends WithTranslation {
  className?: string;
  txType: string;
  autoClickProtection?: boolean;
  pending?: boolean;
  collapsed?: boolean;
  txHash: string;
  assets: Record<string, AssetDetail>;
  message: Message;
  selectedAccount: Account;

  onClose: (...args: unknown[]) => void;
  onNext: (...args: unknown[]) => void;
  onList: (...args: unknown[]) => void;
  approve: (...args: unknown[]) => void;
  reject: (...args: unknown[]) => void;
  rejectForever: (...args: unknown[]) => void;
  selectAccount: () => void;
}
