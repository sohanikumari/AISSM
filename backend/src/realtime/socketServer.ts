import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export class RealtimeServer {
  private io: SocketIOServer | null = null;
  private syncTimer: NodeJS.Timeout | null = null;

  init(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      },
    });

    this.io.on('connection', (socket: Socket) => {
      // Send initial server time sync
      socket.emit('time.sync', { server_now: new Date().toISOString() });

      // Join room by role or userId if provided
      socket.on('join', (room: string) => {
        socket.join(room);
      });

      socket.on('leave', (room: string) => {
        socket.leave(room);
      });
    });

    // Periodic time.sync broadcast every 15 seconds
    this.syncTimer = setInterval(() => {
      this.broadcast('time.sync', { server_now: new Date().toISOString() });
    }, 15000);

    console.log('[RealtimeServer] Socket.IO realtime server initialized');
  }

  broadcast(event: string, payload: any) {
    if (!this.io) return;
    this.io.emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: any) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, payload);
  }

  stop() {
    if (this.syncTimer) clearInterval(this.syncTimer);
    if (this.io) this.io.close();
  }
}

export const realtimeServer = new RealtimeServer();
