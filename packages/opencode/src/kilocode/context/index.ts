// kilocode_change - new file
// Context (lazy senior dev) commands bundled as built-in slash commands.

import { CONTEXT_COMMANDS } from "../context/commands"
import type { Info as CommandInfo } from "@/command"

export function contextCommands(opts?: { enabled?: boolean }): Record<string, CommandInfo> {
  if (opts?.enabled === false) return {}
  const result: Record<string, CommandInfo> = {}
  for (const cmd of CONTEXT_COMMANDS) {
    result[cmd.name] = {
      name: cmd.name,
      description: cmd.description,
      source: "command",
      template: cmd.content,
      hints: cmd.content.includes("$ARGUMENTS") ? ["$ARGUMENTS"] : [],
    }
  }
  return result
}
