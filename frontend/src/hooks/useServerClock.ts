import { useState, useEffect } from 'react';
import { api } from '../api';
import { mockRealtime } from '../realtime/mockRealtime';

let globalOffsetMs = 0;

export function useServerClock() {
  const [now, setNow] = useState(new Date(Date.now() + globalOffsetMs));

  useEffect(() => {
    // Sync with server
    api.serverNow().then((serverIso) => {
      globalOffsetMs = new Date(serverIso).getTime() - Date.now();
      setNow(new Date(Date.now() + globalOffsetMs));
    });

    const unsubscribe = mockRealtime.on('time.sync', (data: { server_now: string }) => {
      globalOffsetMs = new Date(data.server_now).getTime() - Date.now();
    });

    const interval = setInterval(() => {
      setNow(new Date(Date.now() + globalOffsetMs));
    }, 1000);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return { now, offsetMs: globalOffsetMs };
}
