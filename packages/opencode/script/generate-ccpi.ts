#!/usr/bin/env bun

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { execSync } from "child_process"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.resolve(__dirname, "..")
const ccpiRoot = path.resolve(dir, "../../.tmp-ccpi")
const outDir = path.resolve(dir, "src/kilocode/ccpi")

function rebrand(content: string): string {
  return content
    .replace(/Jeremy Longshore <jeremy@intentsolutions\.io>/g, "Legion CLI")
    .replace(/Jeremy Longshore/g, "Legion CLI")
    .replace(/jeremy@intentsolutions\.io/g, "legion@legioncli.com")
    .replace(/claude-code/g, "legion-cli")
    .replace(/Claude Code/g, "Legion CLI")
    .replace(/claude code/g, "legion cli")
    .replace(/compatible-with:\s*claude-code/g, "compatible-with: legion-cli")
    .replace(/~\/\.claude\//g, "~/.legion/")
    .replace(/~\/\.claude/g, "~/.legion")
    .replace(/CLAUDE\.md/g, "LEGION.md")
    .replace(/\.claude\/settings\.json/g, ".legion/settings.json")
    .replace(/claude -p/g, "legion -p")
    .replace(/Claude CLI/g, "Legion CLI")
    .replace(/Claude's/g, "Legion's")
    .replace(/anthropic-ai\/claude-code/g, "legion-cli/legion")
    .replace(/claude-code@latest/g, "legion@latest")
    .replace(/npm install -g @anthropic-ai\/claude-code/g, "npm install -g @legioncli")
    .replace(/@anthropic-ai\/claude-code/g, "@legioncli")
}

interface SkillEntry {
  name: string
  description: string
  content: string
  category: string
}

async function ensureRepo() {
  if (fs.existsSync(path.join(ccpiRoot, "skills"))) {
    console.log("Using existing CCPI clone...")
    execSync(`cd "${ccpiRoot}" && git sparse-checkout add skills plugins`, { stdio: "inherit" })
    return
  }
  console.log("Cloning CCPI repository...")
  execSync(
    `git clone --depth 1 --filter=blob:none --sparse https://github.com/jeremylongshore/claude-code-plugins-plus-skills.git "${ccpiRoot}"`,
    { stdio: "inherit" }
  )
  execSync(`cd "${ccpiRoot}" && git sparse-checkout set skills plugins`, { stdio: "inherit" })
}

function parseSkillFile(raw: string): { name: string; description: string } {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/)
  let name = ""
  let description = ""
  if (fmMatch) {
    const fm = fmMatch[1]
    const nameMatch = fm.match(/^name:\s*(.+)$/m)
    const descMatch = fm.match(/^description:\s*[|>]*\s*\n?([\s\S]*?)(?=\n\w|\n---)/m)
    if (nameMatch) name = nameMatch[1].trim().replace(/^"|"$/g, "")
    if (descMatch) description = descMatch[1].trim().split("\n")[0].trim()
  }
  return { name, description }
}

async function collectStandaloneSkills(): Promise<SkillEntry[]> {
  const dir = path.join(ccpiRoot, "skills")
  if (!fs.existsSync(dir)) return []
  const entries: SkillEntry[] = []
  const categories = await fs.promises.readdir(dir, { withFileTypes: true })

  for (const cat of categories) {
    if (!cat.isDirectory()) continue
    const catDir = path.join(dir, cat.name)
    const skills = await fs.promises.readdir(catDir, { withFileTypes: true })
    const category = cat.name.replace(/^\d+-/, "")

    for (const skill of skills) {
      if (!skill.isDirectory()) continue
      const skillFile = path.join(catDir, skill.name, "SKILL.md")
      if (!fs.existsSync(skillFile)) continue
      const raw = await fs.promises.readFile(skillFile, "utf-8")
      const { name, description } = parseSkillFile(raw)
      entries.push({ name: name || skill.name, description: description || `${name || skill.name} skill`, content: rebrand(raw), category })
    }
  }
  return entries
}

async function collectPluginSkills(): Promise<SkillEntry[]> {
  const dir = path.join(ccpiRoot, "plugins")
  if (!fs.existsSync(dir)) return []
  const entries: SkillEntry[] = []
  const categories = await fs.promises.readdir(dir, { withFileTypes: true })
  const usedNames = new Set<string>()

  for (const cat of categories) {
    if (!cat.isDirectory()) continue
    const catDir = path.join(dir, cat.name)
    const plugins = await fs.promises.readdir(catDir, { withFileTypes: true })

    for (const plugin of plugins) {
      if (!plugin.isDirectory()) continue
      const pluginDir = path.join(catDir, plugin.name)

      const findSkills = async (d: string): Promise<void> => {
        if (!fs.existsSync(d)) return
        const items = await fs.promises.readdir(d, { withFileTypes: true })
        for (const item of items) {
          const fp = path.join(d, item.name)
          if (item.isDirectory()) {
            await findSkills(fp)
          } else if (item.name === "SKILL.md") {
            const raw = await fs.promises.readFile(fp, "utf-8")
            const { name: parsedName, description } = parseSkillFile(raw)
            const skillDirName = path.basename(path.dirname(fp))
            let skillName = parsedName || `${plugin.name}-${skillDirName}`
            if (usedNames.has(skillName)) skillName = `${skillName}-${usedNames.size}`
            usedNames.add(skillName)
            entries.push({ name: skillName, description: description || `${skillName} plugin skill`, content: rebrand(raw), category: cat.name })
          }
        }
      }

      await findSkills(path.join(pluginDir, "skills"))
    }
  }
  return entries
}

function toVarName(name: string, index: number): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 60)
  return `SKILL_${index}_${clean}`
}

function escapeString(content: string): string {
  return content.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$")
}

async function generateSkillsBundle(entries: SkillEntry[]): Promise<string> {
  const lines: string[] = [
    `// Auto-generated by script/generate-ccpi.ts — DO NOT EDIT`,
    `// CCPI (Claude Code Plugins Plus Skills) bundled as built-in defaults`,
    `// Source: https://github.com/jeremylongshore/claude-code-plugins-plus-skills`,
    `// ${entries.length} skills — lazy loaded from memory`,
    ``,
    `export interface CcpiSkill {`,
    `  name: string`,
    `  description: string`,
    `  content: string`,
    `  category: string`,
    `}`,
    ``,
  ]

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const varName = toVarName(entry.name, i)
    lines.push(`const ${varName} = \`${escapeString(entry.content)}\``)
    lines.push("")
  }

  lines.push("export const CCPI_SKILLS: CcpiSkill[] = [")
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const varName = toVarName(entry.name, i)
    lines.push(
      `  { name: ${JSON.stringify(entry.name)}, description: ${JSON.stringify(entry.description)}, content: ${varName}, category: ${JSON.stringify(entry.category)} },`
    )
  }
  lines.push("]")
  lines.push("")

  return lines.join("\n")
}

async function main() {
  await ensureRepo()

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const standalone = await collectStandaloneSkills()
  console.log(`Standalone skills: ${standalone.length}`)

  const plugin = await collectPluginSkills()
  console.log(`Plugin skills: ${plugin.length}`)

  const all = [...standalone, ...plugin]
  console.log(`Total skills: ${all.length}`)

  const skillsContent = await generateSkillsBundle(all)
  fs.writeFileSync(path.join(outDir, "skills.ts"), skillsContent)
  console.log(`Wrote skills.ts`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
