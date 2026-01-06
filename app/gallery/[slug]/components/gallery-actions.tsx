export function GalleryActions({
  isDownloading,
  onDownload,
  onSlideshow,
  variant,
}: {
  isDownloading: boolean;
  onDownload: () => void;
  onSlideshow: () => void;
  variant: 'light' | 'dark';
}) {
  const downloadTitle = isDownloading ? 'Preparing download...' : 'Download All';
  const baseClass = 'p-3 rounded-lg transition-colors disabled:opacity-50';
  const variantClass =
    variant === 'dark'
      ? 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
      : 'bg-bg-white-0 hover:bg-bg-weak-50 text-text-strong-950 shadow-sm border border-stroke-soft-200';

  return (
    <div className="flex gap-3">
      <button
        onClick={onDownload}
        disabled={isDownloading}
        className={`${baseClass} ${variantClass}`}
        title={downloadTitle}
      >
        {isDownloading ? (
          <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        )}
      </button>
      <button
        onClick={onSlideshow}
        className={`${baseClass} ${variantClass}`}
        title="Play Slideshow"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </div>
  );
}
