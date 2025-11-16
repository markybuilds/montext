/**
 * Example MCP wrapper showing how Codex should call tools via code execution.
 *
 * Replace the placeholder server/tool names with real MCP endpoints.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const execFileAsync = promisify(execFile);

export interface ExampleToolArgs {
  documentId: string;
}

export interface ExampleToolResultHandle {
  handle: string;
  summary: string;
}

export async function fetchExampleDocument(
  args: ExampleToolArgs,
  opts: { logsDir?: string } = {}
): Promise<ExampleToolResultHandle> {
  const logsDir = opts.logsDir ?? join(process.cwd(), "context/logs/mcp");
  const { stdout } = await execFileAsync("mcp-cli", [
    "call",
    "example-server",
    "getDocument",
    JSON.stringify(args),
  ]);

  const payload = stdout.trim();
  const hash = Buffer.from(payload).toString("base64url").slice(0, 12);
  const handlePath = join(logsDir, `${hash}.json`);
  writeFileSync(handlePath, payload, "utf-8");

  return {
    handle: `mcp://logs/${hash}.json`,
    summary: `Example document ${args.documentId} stored at ${handlePath}`,
  };
}
