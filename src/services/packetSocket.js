import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:9092";

/**
 * Singleton Socket.IO pour les paquets en temps réel.
 * Événements supportés : "packet" (un paquet), "packets" (liste de paquets).
 */
class PacketSocketService {
  static #instance = null;

  static getInstance() {
    if (PacketSocketService.#instance === null) {
      PacketSocketService.#instance = new PacketSocketService();
    }
    return PacketSocketService.#instance;
  }

  #socket = null;
  #callbacks = {};

  connect() {
    if (this.#socket?.connected) {
      return this.#socket;
    }

    this.#socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.#socket.on("connect", () => {
      this.#callbacks.onConnect?.(this.#socket);
    });

    this.#socket.on("disconnect", (reason) => {
      this.#callbacks.onDisconnect?.(reason);
    });

    this.#socket.on("connect_error", (err) => {
      this.#callbacks.onError?.(err);
    });

    this.#socket.on("packet", (data) => {
      this.#callbacks.onPacket?.(data);
    });

    this.#socket.on("packets", (data) => {
      const list = Array.isArray(data) ? data : data?.packets ?? data?.data ?? [];
      list.forEach((pkt) => this.#callbacks.onPacket?.(pkt));
    });

    return this.#socket;
  }

  disconnect() {
    if (this.#socket) {
      this.#socket.disconnect();
      this.#socket.removeAllListeners();
      this.#socket = null;
      this.#callbacks = {};
    }
  }

  getSocket() {
    return this.#socket;
  }

  /**
   * Souscrire aux paquets. Retourne une fonction unsubscribe.
   */
  subscribe(onPacket) {
    this.#callbacks.onPacket = onPacket;
    this.connect();
    return () => this.disconnect();
  }
}

export const packetSocket = PacketSocketService.getInstance();
export default packetSocket;
