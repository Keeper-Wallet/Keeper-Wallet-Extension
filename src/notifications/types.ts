export interface NotificationsStoreItem {
  address: string;
  id: string;
  message: string | undefined;
  origin: string;
  timestamp: number;
  title: string;
  type: string;
}
