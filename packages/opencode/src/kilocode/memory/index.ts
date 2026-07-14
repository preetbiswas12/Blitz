// kilocode_change - new file
import * as Log from "@opencode-ai/core/util/log"
import * as fs from "fs/promises"
import * as path from "path"

const log = Log.create({ service: "memory" })

function getMemoryPath(): string {
  return path.join(process.env.HOME || process.env.USERPROFILE || "", ".legion", "legion-memory.json")
}

function getGlobalLegionMdPath(): string {
  return path.join(process.env.HOME || process.env.USERPROFILE || "", ".legion", "LEGION.md")
}

async function loadLegionMd(cwd: string): Promise<string | null> {
  const paths = [
    path.join(cwd, "LEGION.md"),
    getGlobalLegionMdPath(),
  ]

  for (const p of paths) {
    try {
      const content = await fs.readFile(p, "utf-8")
      log.info("loaded LEGION.md", { path: p })
      return content
    } catch {
      // continue
    }
  }
  return null
}

async function loadMemoryEntries(): Promise<Array<{ key: string; content: string }>> {
  try {
    const content = await fs.readFile(getMemoryPath(), "utf-8")
    return JSON.parse(content)
  } catch {
    return []
  }
}

export async function formatMemoryContext(cwd: string): Promise<string> {
  const [legionMd, entries] = await Promise.all([loadLegionMd(cwd), loadMemoryEntries()])

  const lines: string[] = []

  if (legionMd) {
    lines.push("# Project Memory (LEGION.md)")
    lines.push("")
    lines.push(legionMd)
    lines.push("")
  }

  if (entries.length > 0) {
    lines.push("# Session Memory")
    lines.push("")
    for (const entry of entries) {
      lines.push(`## ${entry.key}`)
      lines.push(entry.content)
      lines.push("")
    }
  }

  return lines.join("\n")
}

export async function saveMemoryEntry(key: string, content: string, source: string = "user"): Promise<void> {
  const entries = await loadMemoryEntries()
  entries.push({ key, content })
  const dir = path.dirname(getMemoryPath())
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(getMemoryPath(), JSON.stringify(entries, null, 2))
  log.info("saved memory", { key })
}
