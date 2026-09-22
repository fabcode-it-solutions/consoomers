"use client";

import React, { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  formatNotificationTime,
  getNotificationIcon,
} from "@/utils/notificationHelper";
import { Bell } from "lucide-react";

export function NotificationBell({
  userId,
  notificationId,
}: {
  userId: string;
  notificationId: string | null;
}) {
  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({ userId, notificationId });

  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 max-sm:p-1 "
      >
        <Bell className="w-7 h-7 max-sm:w-6 max-sm:h-6" />

        {/* 🔴 Unread Counter */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* 🟢 Connection Indicator */}
      <div
        className={`absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white ${
          isConnected ? "bg-green-500" : "bg-red-500"
        }`}
        title={isConnected ? "Connected" : "Disconnected"}
      />

      {/* Notification Dropdown */}
      {open && (
        <>
          {/* Click outside closes dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow z-50 max-h-96 overflow-auto">
            <div className="p-4 border-b flex justify-between">
              <h3 className="font-semibold">Notifications</h3>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className="p-6">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b cursor-pointer ${
                    !n.isRead ? "bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    markAsRead(n.id);
                    if (n.link) window.location.href = n.link;
                  }}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl">
                      {n.icon || getNotificationIcon(n.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="font-semibold">{n.title}</div>

                        {!n.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>

                      <div className="text-sm text-gray-600">{n.message}</div>

                      <div className="text-xs text-gray-400">
                        {formatNotificationTime(n.createdAt)}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ✖
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
