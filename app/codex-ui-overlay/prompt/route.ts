/* codex-ui-overlay generated: next app route */
import { NextRequest, NextResponse } from "next/server";
import { createLocalAgent } from "uiloop";

let agent: ReturnType<typeof createLocalAgent> | null = null;

const getAgent = () => {
  agent ??= createLocalAgent(process.cwd());
  return agent;
};

export async function GET() {
  return NextResponse.json({ ok: process.env.NODE_ENV === "development", adapter: "next", sessions: await getAgent().listCodexSessions() });
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const payload = await request.json();
    if ("kind" in payload && payload.kind === "handoff") {
      return NextResponse.json(await getAgent().sendToCodex(payload.prompt, payload.accessMode, payload.sessionStrategy, payload.sessionId));
    }
    return NextResponse.json(await getAgent().generatePrompt(payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown agent error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
