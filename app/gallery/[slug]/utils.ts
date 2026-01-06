export function formatEventDate(eventDate?: string) {
  if (!eventDate) return '';
  const date = new Date(eventDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function isUnavailableStatus(status?: string) {
  return status === 'ARCHIVED' || status === 'DELETED';
}

export function openSlideshow() {
  const event = new CustomEvent('openSlideshow');
  window.dispatchEvent(event);
}
