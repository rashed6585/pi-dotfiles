import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import * as fs from "fs";
import * as path from "path";

export default function (pi: ExtensionAPI) {
  const TOOL_NAME = "init_local_workspace_scaffold";

  const SYSTEM_CONTENT = `---
mode: append
---

## Additional Guidelines

- Always explain your reasoning before making changes.
- When editing files, show the diff clearly.
- Prefer small, focused changes over large rewrites.
- If a task is ambiguous, ask for clarification before proceeding.
- Never delete files without explicit confirmation.`;

  const setupWorkspace = (ctx: any) => {
    const baseDir = path.join(process.cwd(), ".pi", "agent");
    
    const dirs = [
      path.join(baseDir, "extensions"),
      path.join(baseDir, "skills"),
      path.join(baseDir, "prompts"),
      path.join(baseDir, "themes"),
      path.join(baseDir, "sessions")
    ];

    const jsonFiles = {
      [path.join(baseDir, "models.json")]: "{}",
      [path.join(baseDir, "settings.json")]: "{}"
    };

    const systemMdPath = path.join(baseDir, "SYSTEM.md");
    const appendSystemMdPath = path.join(baseDir, "APPEND_SYSTEM.md");

    try {
      // 1. Create Directories safely
      dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      // 2. Initialize JSON files if missing
      Object.entries(jsonFiles).forEach(([filePath, content]) => {
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, content, "utf8");
        }
      });

      // 3. Write SYSTEM.md guidelines
      fs.writeFileSync(systemMdPath, SYSTEM_CONTENT, "utf8");

      // 4. Create empty APPEND_SYSTEM.md if missing
      if (!fs.existsSync(appendSystemMdPath)) {
        fs.writeFileSync(appendSystemMdPath, "", "utf8");
      }

      ctx.ui.notify("Workspace initialized successfully!", "success");
    } catch (error: any) {
      ctx.ui.notify(`Scaffolding failed: ${error.message}`, "error");
      console.error(error);
    }
  };

  // Register command: /init-local
  pi.registerCommand("init-local", {
    description: "Scaffold the .pi/agent directory structure locally",
    handler: async (_args, ctx) => {
      setupWorkspace(ctx);
    },
  });

  // Register tool
  pi.registerTool({
    name: TOOL_NAME,
    label: "Scaffold Local Workspace",
    description: "Creates the standard .pi/agent folder structure and guidelines in current dir",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      setupWorkspace(ctx);
      return {
        content: [{ type: "text", text: "Local Pi Agent environment configured using filesystem driver." }],
        details: { path: ".pi/agent/" },
      };
    },
  });
}