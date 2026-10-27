import { useServerClock } from './useServerClock';

export function useCountdown(expiryUtc?: string) {
  const { now } = useServerClock();

  if (!expiryUtc) {
    return { formatted: '—', secondsLeft: 0, isExpired: false };
  }

  const expiry = new Date(expiryUtc).getTime();
  const diffSec = Math.floor((expiry - now.getTime()) / 1000);

  if (diffSec <= 0) {
    return { formatted: 'Expired', secondsLeft: 0, isExpired: true };
  }

  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  let formatted = '';
  if (hours > 0) {
    formatted = `${hours}h ${minutes}m`;
  } else {
    const pad = (n: number) => n.toString().padStart(2, '0');
    formatted = `${pad(minutes)}:${pad(seconds)}`;
  }

  return { formatted, secondsLeft: diffSec, isExpired: false };
}
