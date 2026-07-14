#!/usr/bin/env bun

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { execSync } from "child_process"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.resolve(__dirname, "..")
const eccRoot = path.resolve(dir, "../../.tmp-ecc")
const outDir = path.resolve(dir, "src/kilocode/elc")

function escapeString(content: string): string {
  return content.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$")
}

function rebrand(content: string): string {
  return content
    .replace(/ECC \(Everything Claude Code\)/g, "ELC (Everything Legion Code)")
    .replace(/Everything Claude Code/g, "Everything Legion Code")
    .replace(/Claude Code/g, "Legion CLI")
    .replace(/claude code/g, "legion cli")
    .replace(/Claude CLI/g, "Legion CLI")
    .replace(/Claude's/g, "Legion's")
    .replace(/anthropic-ai\/claude-code/g, "legion-cli/legion")
    .replace(/claude-code@latest/g, "legion@latest")
    .replace(/brew upgrade claude-code/g, "brew upgrade legion")
    .replace(/npm install -g @anthropic-ai\/claude-code/g, "npm install -g @legioncli")
    .replace(/@anthropic-ai\/claude-code/g, "@legioncli")
    .replace(/claude-code/g, "legion")
    .replace(/CLAUDE_PLUGIN_ROOT/g, "LEGION_PLUGIN_ROOT")
    .replace(/~\/\.claude\//g, "~/.legion/")
    .replace(/~\/\.claude/g, "~/.legion")
    .replace(/CLAUDE\.md/g, "LEGION.md")
    .replace(/\.claude\/settings\.json/g, ".legion/settings.json")
    .replace(/claude -p/g, "legion -p")
    // Backtick-escaped .claude/ paths in template literals
    .replace(/\.claude\//g, ".legion/")
    // Standalone Claude references (careful ordering)
    .replace(/Claude \(self\)/g, "Legion (self)")
    .replace(/Claude as Code Sovereign/g, "Legion as Code Sovereign")
    .replace(/Claude handles/g, "Legion handles")
    .replace(/Claude repeatedly/g, "Legion repeatedly")
    .replace(/Claude just edited/g, "Legion just edited")
    .replace(/Claude made/g, "Legion made")
    .replace(/Claude is working/g, "Legion is working")
    .replace(/Claude proceeded/g, "Legion proceeded")
    .replace(/Claude synthesizes/g, "Legion synthesizes")
    .replace(/Claude session/g, "Legion session")
    .replace(/Claude transcripts/g, "Legion transcripts")
    .replace(/Claude transcript/g, "Legion transcript")
    .replace(/Claude\/OpenCode/g, "Legion/OpenCode")
    .replace(/Claude:/g, "Legion:")
    // General Claude → Legion for remaining references
    .replace(/\bClaude\b/g, "Legion")
    .replace(/\bclaude\b/g, "legion")
    // Anthropic references
    .replace(/docs\.anthropic\.com/g, "docs.legioncli.com")
    .replace(/anthropic/g, "legion")
    // ECC → ELC branding
    .replace(/\bECC\b/g, "ELC")
    .replace(/\/ecc-/g, "/elc-")
    .replace(/\becc\b/g, "elc")
    // ECC env vars and paths
    .replace(/ECC_ROOT/g, "ELC_ROOT")
    .replace(/ECC_DISABLED/g, "ELC_DISABLED")
    .replace(/ECC_ENABLE/g, "ELC_ENABLE")
    .replace(/ECC_CONFIG/g, "ELC_CONFIG")
    .replace(/ECC_DIR/g, "ELC_DIR")
    .replace(/ECC_PATH/g, "ELC_PATH")
    .replace(/ECC_VERSION/g, "ELC_VERSION")
    .replace(/ECC_MODE/g, "ELC_MODE")
    .replace(/ECC_GATEGUARD/g, "ELC_GATEGUARD")
    .replace(/ECC_PLAN_CANVAS/g, "ELC_PLAN_CANVAS")
    .replace(/ECC_QUALITY_GATE/g, "ELC_QUALITY_GATE")
    .replace(/ECC_HOOK_PROFILE/g, "ELC_HOOK_PROFILE")
    .replace(/ECC2/g, "ELC2")
    .replace(/resolveEccRoot/g, "resolveElcRoot")
    .replace(/EccRoot/g, "ElcRoot")
}

interface SkillEntry {
  name: string
  description: string
  content: string
}

interface CommandEntry {
  name: string
  description: string
  content: string
}

interface AgentEntry {
  name: string
  description: string
  content: string
}

interface RuleEntry {
  language: string
  filename: string
  content: string
}

async function ensureRepo() {
  if (fs.existsSync(path.join(eccRoot, "skills"))) {
    console.log("Using existing ECC clone...")
    return
  }
  console.log("Cloning ECC repository...")
  execSync(`git clone --depth 1 https://github.com/affaan-m/ecc.git "${eccRoot}"`, {
    stdio: "inherit",
  })
}

async function collectSkills(): Promise<SkillEntry[]> {
  const skillsDir = path.join(eccRoot, "skills")
  const entries: SkillEntry[] = []
  const dirs = await fs.promises.readdir(skillsDir, { withFileTypes: true })

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue
    const skillFile = path.join(skillsDir, dir.name, "SKILL.md")
    if (!fs.existsSync(skillFile)) continue

    const raw = await fs.promises.readFile(skillFile, "utf-8")
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/)
    let name = dir.name
    let description = ""

    if (fmMatch) {
      const fm = fmMatch[1]
      const nameMatch = fm.match(/^name:\s*(.+)$/m)
      const descMatch = fm.match(/^description:\s*(.+)$/m)
      if (nameMatch) name = nameMatch[1].trim()
      if (descMatch) description = descMatch[1].trim()
    }

    entries.push({ name: rebrand(name), description: rebrand(description), content: rebrand(raw) })
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

async function collectCommands(): Promise<CommandEntry[]> {
  const commandsDir = path.join(eccRoot, "commands")
  const entries: CommandEntry[] = []
  const files = await fs.promises.readdir(commandsDir)

  for (const file of files) {
    if (!file.endsWith(".md")) continue
    const raw = await fs.promises.readFile(path.join(commandsDir, file), "utf-8")
    const name = file.replace(/\.md$/, "")
    let description = ""

    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/)
    if (fmMatch) {
      const fm = fmMatch[1]
      const descMatch = fm.match(/^description:\s*(.+)$/m)
      if (descMatch) description = descMatch[1].trim()
    }

    entries.push({ name: rebrand(name), description: rebrand(description), content: rebrand(raw) })
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

async function collectAgents(): Promise<AgentEntry[]> {
  const agentsDir = path.join(eccRoot, "agents")
  const entries: AgentEntry[] = []
  const files = await fs.promises.readdir(agentsDir)

  for (const file of files) {
    if (!file.endsWith(".md")) continue
    const raw = await fs.promises.readFile(path.join(agentsDir, file), "utf-8")
    const name = file.replace(/\.md$/, "")
    let description = ""

    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/)
    if (fmMatch) {
      const fm = fmMatch[1]
      const descMatch = fm.match(/^description:\s*(.+)$/m)
      if (descMatch) description = descMatch[1].trim()
    }

    entries.push({ name: rebrand(name), description: rebrand(description), content: rebrand(raw) })
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

async function collectRules(): Promise<RuleEntry[]> {
  const rulesDir = path.join(eccRoot, "rules")
  const entries: RuleEntry[] = []
  const dirs = await fs.promises.readdir(rulesDir, { withFileTypes: true })

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue
    const dirPath = path.join(rulesDir, dir.name)
    const files = await fs.promises.readdir(dirPath)
    for (const file of files) {
      if (!file.endsWith(".md")) continue
      const content = await fs.promises.readFile(path.join(dirPath, file), "utf-8")
      entries.push({ language: dir.name, filename: file, content: rebrand(content) })
    }
  }

  return entries.sort((a, b) => {
    const keyA = `${a.language}/${a.filename}`
    const keyB = `${b.language}/${b.filename}`
    return keyA.localeCompare(keyB)
  })
}

function toVarName(prefix: string, name: string): string {
  return `${prefix}_${name.replace(/[^a-zA-Z0-9]/g, "_")}`
}

async function generateSkills(entries: SkillEntry[]): Promise<string> {
  const lines: string[] = [
    `// Auto-generated by script/generate-ecc.ts — DO NOT EDIT`,
    `// ELC (Everything Legion Code) skills bundled as built-in defaults`,
    ``,
    `export interface ElcSkill {`,
    `  name: string`,
    `  description: string`,
    `  content: string`,
    `}`,
    ``,
  ]

  for (const entry of entries) {
    const varName = toVarName("SKILL", entry.name)
    lines.push(`const ${varName} = \`${escapeString(entry.content)}\``)
    lines.push("")
  }

  lines.push(`export const ELC_SKILLS: ElcSkill[] = [`)
  for (const entry of entries) {
    const varName = toVarName("SKILL", entry.name)
    lines.push(`  { name: ${JSON.stringify(entry.name)}, description: ${JSON.stringify(entry.description)}, content: ${varName} },`)
  }
  lines.push(`]`)
  lines.push("")

  return lines.join("\n")
}

async function generateCommands(entries: CommandEntry[]): Promise<string> {
  const lines: string[] = [
    `// Auto-generated by script/generate-ecc.ts — DO NOT EDIT`,
    `// ELC (Everything Legion Code) commands bundled as built-in defaults`,
    ``,
    `export interface ElcCommand {`,
    `  name: string`,
    `  description: string`,
    `  content: string`,
    `}`,
    ``,
  ]

  for (const entry of entries) {
    const varName = toVarName("CMD", entry.name)
    lines.push(`const ${varName} = \`${escapeString(entry.content)}\``)
    lines.push("")
  }

  lines.push(`export const ELC_COMMANDS: ElcCommand[] = [`)
  for (const entry of entries) {
    const varName = toVarName("CMD", entry.name)
    lines.push(`  { name: ${JSON.stringify(entry.name)}, description: ${JSON.stringify(entry.description)}, content: ${varName} },`)
  }
  lines.push(`]`)
  lines.push("")

  return lines.join("\n")
}

async function generateAgents(entries: AgentEntry[]): Promise<string> {
  const lines: string[] = [
    `// Auto-generated by script/generate-ecc.ts — DO NOT EDIT`,
    `// ELC (Everything Legion Code) agents bundled as built-in defaults`,
    ``,
    `export interface ElcAgent {`,
    `  name: string`,
    `  description: string`,
    `  content: string`,
    `}`,
    ``,
  ]

  for (const entry of entries) {
    const varName = toVarName("AGENT", entry.name)
    lines.push(`const ${varName} = \`${escapeString(entry.content)}\``)
    lines.push("")
  }

  lines.push(`export const ELC_AGENTS: ElcAgent[] = [`)
  for (const entry of entries) {
    const varName = toVarName("AGENT", entry.name)
    lines.push(`  { name: ${JSON.stringify(entry.name)}, description: ${JSON.stringify(entry.description)}, content: ${varName} },`)
  }
  lines.push(`]`)
  lines.push("")

  return lines.join("\n")
}

async function generateRules(entries: RuleEntry[]): Promise<string> {
  const lines: string[] = [
    `// Auto-generated by script/generate-ecc.ts — DO NOT EDIT`,
    `// ELC (Everything Legion Code) language rules bundled as built-in instructions`,
    ``,
    `export interface ElcRule {`,
    `  language: string`,
    `  filename: string`,
    `  content: string`,
    `}`,
    ``,
  ]

  for (const entry of entries) {
    const varName = toVarName("RULE", `${entry.language}_${entry.filename}`)
    lines.push(`const ${varName} = \`${escapeString(entry.content)}\``)
    lines.push("")
  }

  lines.push(`export const ELC_RULES: ElcRule[] = [`)
  for (const entry of entries) {
    const varName = toVarName("RULE", `${entry.language}_${entry.filename}`)
    lines.push(`  { language: ${JSON.stringify(entry.language)}, filename: ${JSON.stringify(entry.filename)}, content: ${varName} },`)
  }
  lines.push(`]`)
  lines.push("")

  return lines.join("\n")
}

async function main() {
  console.log("Generating ELC bundles...")

  await ensureRepo()
  await fs.promises.mkdir(outDir, { recursive: true })

  const [skills, commands, agents, rules] = await Promise.all([
    collectSkills(),
    collectCommands(),
    collectAgents(),
    collectRules(),
  ])

  console.log(`  Skills: ${skills.length}`)
  console.log(`  Commands: ${commands.length}`)
  console.log(`  Agents: ${agents.length}`)
  console.log(`  Rules: ${rules.length}`)

  const [skillsCode, commandsCode, agentsCode, rulesCode] = await Promise.all([
    generateSkills(skills),
    generateCommands(commands),
    generateAgents(agents),
    generateRules(rules),
  ])

  await Promise.all([
    fs.promises.writeFile(path.join(outDir, "skills.ts"), skillsCode),
    fs.promises.writeFile(path.join(outDir, "commands.ts"), commandsCode),
    fs.promises.writeFile(path.join(outDir, "agents.ts"), agentsCode),
    fs.promises.writeFile(path.join(outDir, "rules.ts"), rulesCode),
  ])

  console.log(`Generated files in ${outDir}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
