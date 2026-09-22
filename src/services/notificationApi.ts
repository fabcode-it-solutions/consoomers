/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/notificationApi.ts

import { NotificationData } from '@/types/notification';
import axios from 'axios';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface CreateNotificationPayload {
  type: string;
  title?: string;
  message?: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  recipientId: string;
  data?: Record<string, any>;
  link?: string;
  icon?: string;
}

export interface CreateGroupNotificationPayload extends Omit<CreateNotificationPayload, 'recipientId'> {
  recipientIds: string[];
  groupId?: string;
}

class NotificationApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Create a single notification
   */
  async createNotification(payload: CreateNotificationPayload): Promise<NotificationData> {
    const response = await axios.post(`${this.baseUrl}/notifications`, payload);
    return response.data.data;
  }

  /**
   * Create group notification
   */
  async createGroupNotification(payload: CreateGroupNotificationPayload): Promise<NotificationData[]> {
    const response = await axios.post(`${this.baseUrl}/notifications/group`, payload);
    return response.data.data;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: NotificationData[]; pagination: any }> {
    const response = await axios.get(`${this.baseUrl}/notifications/user/${userId}`, {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const response = await axios.get(`${this.baseUrl}/notifications/user/${userId}/unread-count`);
    return response.data.data.count;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<NotificationData> {
    const response = await axios.patch(`${this.baseUrl}/notifications/${notificationId}/read`);
    return response.data.data;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    const response = await axios.patch(`${this.baseUrl}/notifications/user/${userId}/read-all`);
    return response.data.data.count;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/notifications/${notificationId}`);
  }

  /**
   * Delete all user notifications
   */
  async deleteAllUserNotifications(userId: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/notifications/user/${userId}`);
  }
}

export const notificationApi = new NotificationApi();

export default notificationApi;