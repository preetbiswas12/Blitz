// kilocode_change - new file
// Lazy accessor for CCPI skill content.
// skills.ts is a large generated file (~22MB). We only import the array reference
// here and resolve content on demand to avoid bloating the BUILTIN_SKILLS array.

import { CCPI_SKILLS } from "./skills"

export interface CcpiSkillMeta {
  name: string
  description: string
  category: string
  index: number
}

let indexByName: Map<string, number> | null = null

function ensureIndex() {
  if (indexByName) return
  indexByName = new Map()
  for (let i = 0; i < CCPI_SKILLS.length; i++) {
    indexByName.set(CCPI_SKILLS[i].name, i)
  }
}

export function getCcpiSkillMetas(): CcpiSkillMeta[] {
  return CCPI_SKILLS.map((s, i) => ({ name: s.name, description: s.description, category: s.category, index: i }))
}

export function getCcpiSkillContent(name: string): string | null {
  ensureIndex()
  const idx = indexByName!.get(name)
  if (idx === undefined) return null
  return CCPI_SKILLS[idx].content
}
