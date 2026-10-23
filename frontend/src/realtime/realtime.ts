export type EventHandler = (data: any) => void;

export interface RealtimeAdapter {
  connect(): void;
  disconnect(): void;
  on(event: string, handler: EventHandler): () => void;
  emit(event: string, data: any): void;
  isConnected(): boolean;
}
