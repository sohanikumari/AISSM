import { useEffect } from 'react';
import { mockRealtime } from '../realtime/mockRealtime';
import { EventHandler } from '../realtime/realtime';

export function useRealtimeEvent(event: string, handler: EventHandler) {
  useEffect(() => {
    const unsub = mockRealtime.on(event, handler);
    return () => unsub();
  }, [event, handler]);
}
