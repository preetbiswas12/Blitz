// kilocode_change - new file
// Lazy accessor for CCPI skill content.
// skills.ts is a large generated file (~22MB / 649K lines).
// Dynamic import() defers loading until a CCPI skill is actually accessed.

export interface CcpiSkillMeta {
  name: string
  description: string
  category: string
  index: number
}

let _skills: { name: string; description: string; content: string; category: string }[] | null = null

async function loadSkills() {
  if (!_skills) {
    const mod = await import("./skills")
    _skills = mod.CCPI_SKILLS
  }
  return _skills
}

export async function getCcpiSkillMetas(): Promise<CcpiSkillMeta[]> {
  const skills = await loadSkills()
  return skills.map((s, i) => ({ name: s.name, description: s.description, category: s.category, index: i }))
}

export async function getCcpiSkillContent(name: string): Promise<string | null> {
  const skills = await loadSkills()
  const skill = skills.find((s) => s.name === name)
  return skill?.content ?? null
}
