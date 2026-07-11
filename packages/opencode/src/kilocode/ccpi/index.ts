// kilocode_change - new file
// CCPI (Claude Code Plugins Plus Skills) bundled as built-in defaults.
// Source: https://github.com/jeremylongshore/claude-code-plugins-plus-skills

import { CCPI_SKILLS } from "./skills"

export function ccpiSkills(opts?: { enabled?: boolean }) {
  if (opts?.enabled === false) return []
  return CCPI_SKILLS.map((s) => ({
    name: s.name,
    description: s.description,
    content: s.content,
  }))
}
