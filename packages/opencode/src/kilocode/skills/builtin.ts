// kilocode_change - new file
// Built-in skills that ship inside the CLI binary.
// Content is inlined at compile time via Bun's static import of .md files.
// Registered before all discovery phases so user skills with the same name override.

import LEGION_CONFIG from "./kilo-config.md"
import { ECC_SKILLS } from "../ecc/skills"
import { PONYTAIL_SKILLS } from "../ponytail/skills"

export interface BuiltinSkill {
  name: string
  description: string
  content: string
}

const LEGION_SKILLS: BuiltinSkill[] = [
  {
    name: "legion-config",
    description:
      "Guide for Legion configuration: config paths, legion.json fields, commands, agents, skills, permissions, MCPs, providers, TUI settings, plus Agent Manager worktree setup/run scripts, workflows, and state. Use for Legion config questions, locating loaded config, changing settings, or Agent Manager questions about run/setup scripts, worktree setup/workflows, apply/merge/PR/conflicts, missing sessions/worktrees, and agent-manager.json recovery.",
    content: LEGION_CONFIG,
  },
]

export const BUILTIN_SKILLS: BuiltinSkill[] = [
  ...LEGION_SKILLS,
  ...ECC_SKILLS.map((s) => ({
    name: s.name,
    description: s.description,
    content: s.content,
  })),
  ...PONYTAIL_SKILLS.map((s) => ({
    name: s.name,
    description: s.description,
    content: s.content,
  })),
]
