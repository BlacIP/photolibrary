import { useCallback, useState } from 'react';
import type { AlertState, ConfirmState } from '../types';

const emptyAlert: AlertState = { open: false, title: '', message: '' };
const emptyConfirm: ConfirmState = {
  open: false,
  title: '',
  message: '',
  onConfirm: () => undefined,
};

export function useAlerts() {
  const [alertState, setAlertState] = useState<AlertState>(emptyAlert);
  const [confirmState, setConfirmState] = useState<ConfirmState>(emptyConfirm);

  const showAlert = useCallback((title: string, message: string) => {
    setAlertState({ open: true, title, message });
  }, []);

  const showConfirm = useCallback(
    (title: string, message: string, onConfirm: () => void) => {
      setConfirmState({ open: true, title, message, onConfirm });
    },
    []
  );

  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, open: false }));
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    alertState,
    confirmState,
    showAlert,
    showConfirm,
    closeAlert,
    closeConfirm,
  };
}
