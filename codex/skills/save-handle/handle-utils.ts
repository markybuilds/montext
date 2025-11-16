import { writeFileSync } from "node:fs";
import { join } from "node:path";

export interface SaveHandleOptions {
  data: string;
  prefix?: string;
  logsDir?: string;
}

/**
 * Saves raw tool output to the MCP logs directory and returns a handle
 * that agents can reference in prompts instead of pasting the data.
 */
export function saveHandle({
  data,
  prefix = "payload",
  logsDir = join(process.cwd(), "context/logs/mcp"),
}: SaveHandleOptions): { handle: string; path: string } {
  const hash = Buffer.from(`${prefix}-${Date.now()}`).toString("base64url").slice(0, 12);
  const file = join(logsDir, `${prefix}-${hash}.txt`);
  writeFileSync(file, data, "utf-8");
  return {
    handle: `mcp://logs/${prefix}-${hash}.txt`,
    path: file,
  };
}
