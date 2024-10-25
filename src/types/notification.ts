import {IPagination} from './pagination.ts';

export type DeviceToken = string;

export interface iNotification {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  notificationType: string;
  read: boolean;
  message: string;
}

export interface INotificationsResponse extends IPagination {
  content: iNotification[];
}
