export type Urgency = 'NORMAL' | 'URGENT' | 'CRITICAL' | 'EXPIRED';

export function getUrgency(expiryUtc: string, serverNowIso?: string): Urgency {
  const now = serverNowIso ? new Date(serverNowIso).getTime() : Date.now();
  const expiry = new Date(expiryUtc).getTime();
  const diffMinutes = (expiry - now) / (1000 * 60);

  if (diffMinutes <= 0) return 'EXPIRED';
  if (diffMinutes <= 30) return 'CRITICAL';
  if (diffMinutes <= 120) return 'URGENT';
  return 'NORMAL';
}
