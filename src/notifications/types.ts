import { MsgStatus } from '../constants';

export interface NotificationsStoreItem {
  address: string;
  id: string;
  message: string;
  origin: string;
  status: MsgStatus;
  timestamp: number;
  title: string;
  type: string;
}
