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

function escapeString(content: string): string {
  return content.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$")
}

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
  const skillsDir = path.join(ccpiRoot, "skills")
  if (!fs.existsSync(skillsDir)) return []
  const entries: SkillEntry[] = []

  const categories = await fs.promises.readdir(skillsDir, { withFileTypes: true })
  for (const cat of categories) {
    if (!cat.isDirectory()) continue
    const catDir = path.join(skillsDir, cat.name)
    const skills = await fs.promises.readdir(catDir, { withFileTypes: true })

    for (const skill of skills) {
      if (!skill.isDirectory()) continue
      const skillFile = path.join(catDir, skill.name, "SKILL.md")
      if (!fs.existsSync(skillFile)) continue

      const raw = await fs.promises.readFile(skillFile, "utf-8")
      const { name: parsedName, description } = parseSkillFile(raw)
      const name = parsedName || skill.name
      const category = cat.name.replace(/^\d+-/, "")
      entries.push({ name, description: description || `${name} skill`, content: rebrand(raw), category })
    }
  }

  return entries
}

async function collectPluginSkills(): Promise<SkillEntry[]> {
  const pluginsDir = path.join(ccpiRoot, "plugins")
  if (!fs.existsSync(pluginsDir)) return []
  const entries: SkillEntry[] = []

  const categories = await fs.promises.readdir(pluginsDir, { withFileTypes: true })
  for (const cat of categories) {
    if (!cat.isDirectory()) continue
    const catDir = path.join(pluginsDir, cat.name)
    const plugins = await fs.promises.readdir(catDir, { withFileTypes: true })

    for (const plugin of plugins) {
      if (!plugin.isDirectory()) continue
      const pluginDir = path.join(catDir, plugin.name)

      const findSkills = async (dir: string): Promise<void> => {
        if (!fs.existsSync(dir)) return
        const items = await fs.promises.readdir(dir, { withFileTypes: true })
        for (const item of items) {
          const fullPath = path.join(dir, item.name)
          if (item.isDirectory()) {
            await findSkills(fullPath)
          } else if (item.name === "SKILL.md") {
            const raw = await fs.promises.readFile(fullPath, "utf-8")
            const { name: parsedName, description } = parseSkillFile(raw)
            const skillDirName = path.basename(path.dirname(fullPath))
            const name = parsedName || `${plugin.name}-${skillDirName}`
            entries.push({
              name,
              description: description || `${name} plugin skill`,
              content: rebrand(raw),
              category: cat.name,
            })
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

async function generateSkills(entries: SkillEntry[]): Promise<string> {
  const lines: string[] = [
    `// Auto-generated by script/generate-ccpi.ts — DO NOT EDIT`,
    `// CCPI (Claude Code Plugins Plus Skills) bundled as built-in defaults`,
    `// Source: https://github.com/jeremylongshore/claude-code-plugins-plus-skills`,
    `// Includes ${entries.length} skills from standalone + plugin sources`,
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

  const standalone = await collectStandaloneSkills()
  console.log(`Standalone skills: ${standalone.length}`)

  const plugin = await collectPluginSkills()
  console.log(`Plugin skills: ${plugin.length}`)

  const all = [...standalone, ...plugin]
  console.log(`Total skills: ${all.length}`)

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  const skillsContent = await generateSkills(all)
  fs.writeFileSync(path.join(outDir, "skills.ts"), skillsContent)
  console.log(`Wrote skills.ts`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
