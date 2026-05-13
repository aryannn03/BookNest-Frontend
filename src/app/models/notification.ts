export interface Notification {
  notificationId: number;
  userId: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}