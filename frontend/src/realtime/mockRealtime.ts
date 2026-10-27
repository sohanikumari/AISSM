import { RealtimeAdapter, EventHandler } from './realtime';

export class MockRealtime implements RealtimeAdapter {
  private handlers = new Map<string, Set<EventHandler>>();
  private timer: any = null;

  connect() {
    if (this.timer) return;
    // Emit periodic time sync
    this.timer = setInterval(() => {
      this.emit('time.sync', { server_now: new Date().toISOString() });
    }, 15000);
  }

  disconnect() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  emit(event: string, data: any) {
    const set = this.handlers.get(event);
    if (set) {
      set.forEach((h) => h(data));
    }
  }

  isConnected(): boolean {
    return true;
  }
}

export const mockRealtime = new MockRealtime();
mockRealtime.connect();
