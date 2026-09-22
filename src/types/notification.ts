/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

export type NotificationType =
  | 'user_follow'
  | 'user_unfollow'
  | 'brand_added'
  | 'brand_updated'
  | 'product_liked'
  | 'product_commented'
  | 'product_shared'
  | 'order_placed'
  | 'order_shipped'
  | 'order_delivered'
  | 'payment_received'
  | 'message_received'
  | 'mention'
  | 'vote'
  | 'custom';

export interface NotificationData {
   createdAt: string | Date;
  type: NotificationType;
  title?: string;
  message?: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  recipientId: string;
  data?: Record<string, any>;
  link?: string;
  icon?: string;
  isGroupNotification?: boolean;
  groupId?: string;
   isRead: boolean;
   id: string;
   
}

export interface GroupNotificationData extends Omit<NotificationData, 'recipientId'> {
  recipientIds: string[];
  groupId?: string;
}

export interface NotificationTemplate {
  type: NotificationType;
  title: (data: any) => string;
  message: (data: any) => string;
  icon?: string;
  link?: (data: any) => string;
}

export interface SocketUser {
  userId: string;
  socketId: string;
  username?: string;
  connectedAt: Date;
}

export interface ClientToServerEvents {
  authenticate: (data: { userId: string; username?: string }) => void;
  send_notification: (notification: NotificationData) => void;
  send_group_notification: (notification: GroupNotificationData) => void;
  mark_as_read: (notificationId: string) => void;
  mark_all_as_read: (userId: string) => void;
  get_unread_count: (userId: string) => void;
  join_room: (roomId: string) => void;
  leave_room: (roomId: string) => void;
}

export interface ServerToClientEvents {
  notification: (notification: NotificationResponse) => void;
  notification_read: (data: { notificationId: string }) => void;
  notifications_read_all: (data: { userId: string; count: number }) => void;
  unread_count: (data: { userId: string; count: number }) => void;
  error: (error: { message: string; code?: string }) => void;
  connected: (data: { userId: string; socketId: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
  username?: string;
}

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  recipientId: string;
  data?: Record<string, any>;
  link?: string;
  icon?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  isGroupNotification?: boolean;
  groupId?: string;
}

export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type TypedServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;