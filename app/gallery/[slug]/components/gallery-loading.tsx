export function GalleryLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-white-0">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-base mx-auto" />
        <p className="mt-4 text-text-sub-600">Loading gallery...</p>
      </div>
    </div>
  );
}
