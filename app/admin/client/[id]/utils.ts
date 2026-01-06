import { format } from 'date-fns';

export const statusClassMap: Record<string, string> = {
  ARCHIVED: 'bg-orange-100 text-orange-700 border-orange-200',
  DELETED: 'bg-red-100 text-red-700 border-red-200',
  ACTIVE: 'bg-green-100 text-green-700 border-green-200',
};

export function getStatusClass(statusLabel?: string) {
  return statusClassMap[statusLabel || ''] || statusClassMap.ACTIVE;
}

export function getEventDateLabel(eventDate?: string) {
  const hasValidDate = eventDate && !Number.isNaN(new Date(eventDate).getTime());
  return hasValidDate ? format(new Date(eventDate as string), 'PPP') : 'Date not set';
}

export function getOptimizedUrl(url: string, width = 600) {
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}
