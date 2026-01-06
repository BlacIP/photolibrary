import { RiCheckLine } from '@remixicon/react';

export function StatusAlerts({ message, error }: { message: string; error: string }) {
  return (
    <>
      {message && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
          <RiCheckLine size={20} /> {message}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-error-weak/10 text-error-base rounded-lg">{error}</div>
      )}
    </>
  );
}
