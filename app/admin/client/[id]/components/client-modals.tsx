import * as Modal from '@/components/ui/modal';
import type { AlertState, ConfirmState } from '../types';

export function AlertModal({
  alertState,
  onClose,
}: {
  alertState: AlertState;
  onClose: () => void;
}) {
  return (
    <Modal.Root open={alertState.open} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content>
        <Modal.Header title={alertState.title || undefined} />
        <div className="p-6">
          <p className="text-text-sub-600 whitespace-pre-wrap">{alertState.message}</p>
        </div>
        <Modal.Footer>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-base text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
          >
            OK
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export function ConfirmModal({
  confirmState,
  onConfirm,
  onClose,
}: {
  confirmState: ConfirmState;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal.Root open={confirmState.open} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content>
        <Modal.Header title={confirmState.title || undefined} />
        <div className="p-6">
          <p className="text-text-sub-600 whitespace-pre-wrap">{confirmState.message}</p>
        </div>
        <Modal.Footer>
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-sub-600 hover:bg-bg-weak-50 rounded-lg text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-primary-base text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
          >
            Confirm
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
