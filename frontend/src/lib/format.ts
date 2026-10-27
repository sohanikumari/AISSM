import { format, parseISO } from 'date-fns';

export function formatLocal(utcIso?: string, pattern: string = 'PP p'): string {
  if (!utcIso) return '—';
  try {
    const date = parseISO(utcIso);
    return format(date, pattern);
  } catch (e) {
    return utcIso;
  }
}

export function formatTimeAgo(utcIso?: string): string {
  if (!utcIso) return '';
  try {
    const diffSec = Math.floor((Date.now() - new Date(utcIso).getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return `${Math.floor(diffH / 24)}d ago`;
  } catch {
    return '';
  }
}
