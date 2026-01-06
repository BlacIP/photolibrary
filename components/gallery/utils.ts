export function getOptimizedUrl(url: string, width = 800) {
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}

export function getDownloadUrl(url: string, filename: string) {
  if (url.includes('cloudinary.com')) {
    const nameWithoutExt = filename.split('.').slice(0, -1).join('.') || filename;
    return url.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(nameWithoutExt)}/`);
  }
  return url;
}

export function getGallerySlug() {
  return window.location.pathname.split('/').pop();
}
