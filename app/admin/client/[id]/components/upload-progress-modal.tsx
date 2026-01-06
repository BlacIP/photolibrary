import { RiLoader4Line } from '@remixicon/react';
import * as Modal from '@/components/ui/modal';
import * as ProgressBar from '@/components/ui/progress-bar';

export function UploadProgressModal({
  open,
  progress,
  totalFiles,
}: {
  open: boolean;
  progress: number;
  totalFiles: number;
}) {
  return (
    <Modal.Root open={open}>
      <Modal.Content showClose={false}>
        <Modal.Header
          icon={RiLoader4Line}
          title="Uploading Photos"
          description="Please wait while we upload your photos. Do not close this page."
        />
        <div className="px-5 pb-6">
          <div className="mb-2 flex justify-between text-xs font-medium text-text-sub-600">
            <span>
              {progress} of {totalFiles} uploaded
            </span>
            <span>{Math.round((progress / Math.max(totalFiles, 1)) * 100)}%</span>
          </div>
          <ProgressBar.Root value={progress} max={totalFiles} color="blue" />
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
