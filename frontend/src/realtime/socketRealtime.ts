import { io, Socket } from 'socket.io-client';
import { RealtimeAdapter, EventHandler } from './realtime';

export class SocketRealtime implements RealtimeAdapter {
  private socket: Socket | null = null;
  private url: string;

  constructor(url: string = 'http://localhost:4000') {
    this.url = url;
  }

  connect() {
    if (this.socket) return;
    this.socket = io(this.url, {
      transports: ['websocket', 'polling'],
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, handler: EventHandler): () => void {
    if (!this.socket) this.connect();
    this.socket?.on(event, handler);
    return () => {
      this.socket?.off(event, handler);
    };
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}

export const socketRealtime = new SocketRealtime();
