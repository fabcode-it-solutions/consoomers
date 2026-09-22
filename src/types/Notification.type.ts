/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'alert';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
  
}


export interface ServerToClientEvents {
  'notification:receive': (notification: Notification) => void;
  'notification:read': (notificationId: string) => void;
  'notification:deleted': (notificationId: string) => void;
  'notification:all-read': () => void;
}


export interface ClientToServerEvents {

  register: (userId: string) => void;
  'notification:send': (data: {
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'alert';
    actionUrl?: string;
    metadata?: Record<string, any>;
  }) => void;


  'notification:mark-read': (notificationId: string) => void;
  'notification:mark-all-read': () => void;
  'notification:delete': (notificationId: string) => void;
}

export type Socket = import('socket.io-client').Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;
