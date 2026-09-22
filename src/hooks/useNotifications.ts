/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useRef } from "react";
import notificationApi from "../services/notificationApi";
import { NotificationData } from "@/types/notification";
import { socketService } from "@/services/socketService";

interface UseNotificationsParams {
  userId: string;
  notificationId: string | null;
}

export const useNotifications = ({
  userId,
  notificationId,
}: UseNotificationsParams) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initialized = useRef(false);

  // Normalize notification ID
  const getId = (n: any) => n.id ?? n._id ?? n.notificationId;

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const { data } = await notificationApi.getUserNotifications(userId, 50, 0);

      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const count = await notificationApi.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error("❌ Error fetching unread count:", error);
    }
  }, [userId]);

  /**
   * Handle new notification event
   */
  const handleNewNotification = useCallback((notification: NotificationData) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Play sound
    try {
      const audio = new Audio("/notification-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}

    // Browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title || "New Notification", {
        body: notification.message,
        icon: "/notification-icon.png",
      });
    }
  }, []);

  const handleConnected = useCallback(() => {
    setIsConnected(true);
  }, []);

  const handleDisconnected = useCallback(() => {
    setIsConnected(false);
  }, []);

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback(
    async (notifId: string) => {
      try {
        await notificationApi.markAsRead(notifId);

        setNotifications((prev) =>
          prev.map((n) =>
            getId(n) === notifId ? { ...n, isRead: true, readAt: new Date() } : n
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("❌ Error marking as read:", error);
      }
    },
    []
  );

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead(userId);

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("❌ Error marking all read:", error);
    }
  }, [userId]);

  /**
   * Delete one notification
   */
  const deleteNotification = useCallback(
    async (notifId: string) => {
      try {
        await notificationApi.deleteNotification(notifId);

        const target = notifications.find((n) => getId(n) === notifId);

        setNotifications((prev) =>
          prev.filter((n) => getId(n) !== notifId)
        );

        if (target && !target.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("❌ Error deleting notification:", error);
      }
    },
    [notifications]
  );

  /**
   * Delete all notifications
   */
  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationApi.deleteAllUserNotifications(userId);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("❌ Error deleting all notifications:", error);
    }
  }, [userId]);

  /**
   * Refresh data from server
   */
  const refresh = useCallback(async () => {
    await fetchNotifications();
    await fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  /**
   * Initialize socket + fetch data
   */
  useEffect(() => {
    if (!userId || !notificationId) return;
    if (initialized.current) return;

    initialized.current = true;

    // Ask notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Fetch initial data
    fetchNotifications();
    fetchUnreadCount();

    // Connect socket
    socketService.connect(notificationId);

    socketService.on("notification", handleNewNotification);
    socketService.on("connected", handleConnected);
    socketService.on("disconnect", handleDisconnected);

    const interval = setInterval(() => {
      setIsConnected(socketService.isConnected());
    }, 2000);

    return () => {
      clearInterval(interval);
      socketService.off("notification", handleNewNotification);
      socketService.off("connected", handleConnected);
      socketService.off("disconnect", handleDisconnected);
      socketService.disconnect();
      initialized.current = false;
    };
  }, [
    userId,
    notificationId,
    fetchNotifications,
    fetchUnreadCount,
    handleNewNotification,
    handleConnected,
    handleDisconnected,
  ]);

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refresh,
  };
};

export default useNotifications;
