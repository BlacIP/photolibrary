/* codex-ui-overlay generated: next app overlay provider */
"use client";

import { useEffect } from "react";
import { mountCodexOverlay } from "uiloop/client";

export function CodexUiOverlayProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    window.__CODEX_UI_OVERLAY_ADAPTER = "next";
    window.__CODEX_UI_OVERLAY_PROMPT_ENDPOINT = "/codex-ui-overlay/prompt";
    mountCodexOverlay();
  }, []);

  return null;
}
