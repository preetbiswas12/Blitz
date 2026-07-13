// kilocode_change - new file
// Lazy accessor for CCPI skill content.
// Skills stored as skills.json (plain data, not TypeScript).
// Loaded via Bun.file() — never parsed by the type checker.

import fs from "fs"
import path from "path"

export interface CcpiSkillMeta {
  name: string
  description: string
  category: string
  index: number
}

interface CcpiSkillEntry {
  name: string
  description: string
  content: string
  category: string
}

let _skills: CcpiSkillEntry[] | null = null

function loadSkillsJson(): CcpiSkillEntry[] {
  if (_skills) return _skills
  const jsonPath = path.join(import.meta.dir, "skills.json")
  if (!fs.existsSync(jsonPath)) return []
  const raw = fs.readFileSync(jsonPath, "utf-8")
  _skills = JSON.parse(raw)
  return _skills!
}

export function getCcpiSkillMetas(): CcpiSkillMeta[] {
  const skills = loadSkillsJson()
  return skills.map((s, i) => ({ name: s.name, description: s.description, category: s.category, index: i }))
}

export function getCcpiSkillContent(name: string): string | null {
  const skills = loadSkillsJson()
  const skill = skills.find((s) => s.name === name)
  return skill?.content ?? null
}
