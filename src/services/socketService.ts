/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private currentNotificationId: string | null = null;

  connect(notificationId: string) {
    console.log("🚀 socketService.connect() CALLED with:", notificationId);

    if (!notificationId) {
      console.error("❌ socketService.connect requires notificationId");
      return;
    }

    // Already connected with same ID
    if (this.socket?.connected && this.currentNotificationId === notificationId) {
      console.log("🔄 Already connected — re-registering notificationId:", notificationId);
      this.socket.emit("register", notificationId);
      return this.socket;
    }

    // If connected with another ID → disconnect first
    if (this.socket?.connected && this.currentNotificationId !== notificationId) {
      console.log("⚠️ Switching notificationId → disconnecting old socket");
      this.disconnect();
    }

    this.currentNotificationId = notificationId;

    const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    console.log("🌐 Connecting to socket server:", url);

    // Create new socket instance
    this.socket = io(url, {
      transports: ["websocket", "polling"], // safer default
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // ----------- SOCKET EVENTS WITH LOGGING ----------- //

    this.socket.on("connect", () => {
      console.log("🟢 CONNECTED to server, socketId:", this.socket?.id);
      console.log("📨 Sending register(notificationId):", notificationId);

      this.socket?.emit("register", notificationId);
      this.emit("connected", { socketId: this.socket?.id, notificationId });
    });

    this.socket.on("connected", (data) => {
      console.log("✅ Server confirmed register:", data);
      this.emit("connected", data);
    });

    this.socket.on("notification", (notification) => {
      console.log("🔔 Notification received from backend:", notification);
      this.emit("notification", notification);
    });

    this.socket.on("disconnect", (reason) => {
      console.warn("🔴 DISCONNECTED from socket:", reason);
      this.emit("disconnect", reason);
    });

    this.socket.on("connect_error", (err) => {
      console.error("❌ CONNECT ERROR:", err.message);
      console.error("❌ Full error object:", err);
    });

    this.socket.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Reconnect attempt #${attempt}`);
    });

    this.socket.on("reconnect", (attempt) => {
      console.log(`🟢 Successful reconnect after ${attempt} attempts`);
      console.log("📨 Re-registering notificationId:", notificationId);

      this.socket?.emit("register", notificationId);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("❌ Failed to reconnect after max attempts");
    });

    this.socket.on("error", (err) => {
      console.error("❌ Socket error event:", err);
    });

    return this.socket;
  }

  // Add event listeners
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)?.add(callback);
  }

  // Remove event listeners
  off(event: string, callback?: Function) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  // Emit to React hook listeners
  private emit(event: string, data: any) {
    const handlers = this.listeners.get(event);
    handlers?.forEach((fn) => {
      try {
        fn(data);
      } catch (err) {
        console.error(`Error in listener for event "${event}"`, err);
      }
    });
  }

  // Check connection
  isConnected() {
    return this.socket?.connected ?? false;
  }

  // Disconnect safely
  disconnect() {
    console.log("🔌 Disconnecting socket service...");

    if (!this.socket) return;

    this.socket.removeAllListeners();
    this.socket.disconnect();

    this.socket = null;
    this.listeners.clear();
    this.currentNotificationId = null;

    console.log("🧹 Socket fully cleaned up.");
  }
}

// Singleton export
export const socketService = new SocketService();
export default socketService;
