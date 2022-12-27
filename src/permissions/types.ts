import type { PERMISSIONS } from './constants';

export type PermissionType =
  | (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
  | 'whiteList';

interface ApprovedItem {
  amount: string;
  time: number;
}

export interface PermissionObject {
  type: PermissionType;
  approved?: ApprovedItem[];
  time?: number;
  canUse?: boolean | null;
  totalAmount?: undefined;
  interval?: undefined;
}

export type PermissionValue = PermissionType | PermissionObject;
