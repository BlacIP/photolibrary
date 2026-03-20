/* codex-ui-overlay generated: next app template */
import type { ReactNode } from "react";
import { CodexUiOverlayProvider } from "./__codex_ui_overlay/overlay-provider";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      <CodexUiOverlayProvider />
      {children}
    </>
  );
}
