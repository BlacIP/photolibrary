'use client';

import { initToolbar } from '@21st-extension/toolbar';
import { useEffect } from 'react';

export function ToolbarSetup() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      initToolbar({
        plugins: [],
      });
    }
  }, []);

  return null;
}
