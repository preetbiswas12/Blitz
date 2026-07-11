// kilocode_change - new file
// ELC (Everything Legion Code) commands bundled as built-in slash commands.

import { ELC_COMMANDS } from "../elc/commands"
import type { Info as CommandInfo } from "@/command"

export function elcCommands(opts?: { enabled?: boolean }): Record<string, CommandInfo> {
  if (opts?.enabled === false) return {}
  const result: Record<string, CommandInfo> = {}
  for (const cmd of ELC_COMMANDS) {
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
