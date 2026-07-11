// kilocode_change - new file
// ECC (Everything Claude Code) commands bundled as built-in slash commands.
// These are separate from ECC skills — commands are executable slash commands
// with argument hints and agent routing, while skills are workflow documents.

import { ECC_COMMANDS } from "../ecc/commands"
import type { Info as CommandInfo } from "@/command"

export function eccCommands(opts?: { enabled?: boolean }): Record<string, CommandInfo> {
  if (opts?.enabled === false) return {}
  const result: Record<string, CommandInfo> = {}
  for (const cmd of ECC_COMMANDS) {
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
