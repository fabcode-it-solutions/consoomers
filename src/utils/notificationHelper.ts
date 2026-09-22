/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateNotificationPayload } from "@/services/notificationApi";
export const formatNotificationTime = (date: Date | string): string => {
  const now = new Date();
  const notifDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - notifDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    return notifDate.toLocaleDateString();
  }
};
export const getNotificationIcon = (type: string): string => {
  const icons: Record<string, string> = {
    user_follow: '👤',
    user_unfollow: '👋',
    brand_added: '🏷️',
    brand_updated: '✏️',
    product_liked: '❤️',
    product_commented: '💬',
    product_shared: '🔗',
    order_placed: '🛒',
    order_shipped: '📦',
    order_delivered: '✅',
    payment_received: '💰',
    message_received: '✉️',
    mention: '@',
    custom: '🔔',
  };

  return icons[type] || '🔔';
};


export const getNotificationColor = (type: string): string => {
  const colors: Record<string, string> = {
    user_follow: 'blue',
    user_unfollow: 'gray',
    brand_added: 'green',
    brand_updated: 'yellow',
    product_liked: 'red',
    product_commented: 'purple',
    product_shared: 'cyan',
    order_placed: 'orange',
    order_shipped: 'blue',
    order_delivered: 'green',
    payment_received: 'green',
    message_received: 'blue',
    mention: 'purple',
    custom: 'gray',
  };

  return colors[type] || 'gray';
};


export const createUserFollowNotification = (
  recipientId: string,
  senderId: string,
  senderName: string,
  senderAvatar?: string
): CreateNotificationPayload => ({
  type: 'user_follow',
  recipientId,
  senderId,
  senderName,
  senderAvatar,
  data: { senderId, senderName },
});

export const createUserUnfollowNotification = (
  recipientId: string,
  senderId: string,
  senderName: string
): CreateNotificationPayload => ({
  type: 'user_unfollow',
  recipientId,
  senderId,
  senderName,
  data: { senderId, senderName },
});

export const createBrandAddedNotification = (
  recipientId: string,
  brandId: string,
  brandName: string,
  senderId?: string,
  senderName?: string
): CreateNotificationPayload => ({
  type: 'brand_added',
  recipientId,
  senderId,
  senderName,
  data: { brandId, brandName },
});

export const createBrandUpdatedNotification = (
  recipientId: string,
  brandId: string,
  brandName: string
): CreateNotificationPayload => ({
  type: 'brand_updated',
  recipientId,
  data: { brandId, brandName },
});

export const createProductLikedNotification = (
  recipientId: string,
  productId: string,
  productName: string,
  senderId: string,
  senderName: string,
  senderAvatar?: string
): CreateNotificationPayload => ({
  type: 'product_liked',
  recipientId,
  senderId,
  senderName,
  senderAvatar,
  data: { productId, productName },
});
export const createProductWishlistNotification = (
  recipientId: string,
  productId: string,
  productName: string,
  senderId: string,
  senderName: string,
  senderAvatar?: string
): CreateNotificationPayload => ({
  type: 'custom', 
  title: 'Product Added to Wishlist',
  message: `${senderName} added your product "${productName}" to their wishlist`,
  recipientId,
  senderId,
  senderName,
  senderAvatar,
  icon: '💖',
  link: `/products/${productId}`,
  data: { productId, productName, action: 'wishlist_add' },
});
export const createProductCommentedNotification = (
  recipientId: string,
  productId: string,
  productName: string,
  comment: string,
  senderId: string,
  senderName: string,
  senderAvatar?: string
): CreateNotificationPayload => ({
  type: 'product_commented',
  recipientId,
  senderId,
  senderName,
  senderAvatar,
  data: { productId, productName, comment },
});

export const createProductSharedNotification = (
  recipientId: string,
  productId: string,
  productName: string,
  senderId: string,
  senderName: string
): CreateNotificationPayload => ({
  type: 'product_shared',
  recipientId,
  senderId,
  senderName,
  data: { productId, productName },
});

export const createOrderPlacedNotification = (
  recipientId: string,
  orderId: string,
  orderTotal?: number
): CreateNotificationPayload => ({
  type: 'order_placed',
  recipientId,
  data: { orderId, orderTotal },
});

export const createOrderShippedNotification = (
  recipientId: string,
  orderId: string,
  trackingNumber?: string
): CreateNotificationPayload => ({
  type: 'order_shipped',
  recipientId,
  data: { orderId, trackingNumber },
});

export const createOrderDeliveredNotification = (
  recipientId: string,
  orderId: string
): CreateNotificationPayload => ({
  type: 'order_delivered',
  recipientId,
  data: { orderId },
});

export const createPaymentReceivedNotification = (
  recipientId: string,
  paymentId: string,
  amount: number,
  currency: string = 'USD'
): CreateNotificationPayload => ({
  type: 'payment_received',
  recipientId,
  data: { paymentId, amount, currency },
});

export const createMessageReceivedNotification = (
  recipientId: string,
  conversationId: string,
  senderId: string,
  senderName: string,
  messagePreview?: string
): CreateNotificationPayload => ({
  type: 'message_received',
  recipientId,
  senderId,
  senderName,
  data: { conversationId, messagePreview },
});

export const createMentionNotification = (
  recipientId: string,
  contentType: string,
  contentId: string,
  senderId: string,
  senderName: string,
  link?: string
): CreateNotificationPayload => ({
  type: 'mention',
  recipientId,
  senderId,
  senderName,
  link,
  data: { contentType, contentId },
});

export const createCustomNotification = (
  recipientId: string,
  title: string,
  message: string,
  data?: Record<string, any>,
  link?: string,
  icon?: string
): CreateNotificationPayload => ({
  type: 'custom',
  title,
  message,
  recipientId,
  data,
  link,
  icon,
});

/**
 * Play notification sound
 */
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => console.warn('Could not play notification sound:', err));
  } catch (err) {
    console.warn('Notification sound not available:', err);
  }
};

/**
 * Request browser notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
};