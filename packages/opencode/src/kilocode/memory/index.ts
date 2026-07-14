// kilocode_change - new file
import { Effect, Context } from "effect"
import { zod } from "@opencode-ai/core/effect-zod"
import { fn } from "@opencode-ai/core/effect"
import * as Log from "@opencode-ai/core/util/log"
import * as fs from "fs/promises"
import * as path from "path"
import { InstanceState } from "@/effect/instance-state"

const log = Log.create({ service: "memory" })

export interface MemoryEntry {
  readonly key: string
  readonly content: string
  readonly source: "legion.md" | "user" | "auto"
  readonly timestamp: number
}

interface MemoryState {
  entries: Map<string, MemoryEntry>
  legionMdContent: string | null
}

const state = InstanceState.state(async (): Promise<MemoryState> => {
  return {
    entries: new Map(),
    legionMdContent: null,
  }
})

export namespace Memory {
  const MEMORY_FILE = "legion-memory.json"
  const LEGION_MD = "LEGION.md"

  function getMemoryPath(): string {
    return path.join(process.env.HOME || process.env.USERPROFILE || "", ".legion", MEMORY_FILE)
  }

  function getGlobalLegionMdPath(): string {
    return path.join(process.env.HOME || process.env.USERPROFILE || "", ".legion", LEGION_MD)
  }

  async function loadLegionMd(cwd: string): Promise<string | null> {
    const paths = [
      path.join(cwd, LEGION_MD),
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

  async function loadMemoryFile(): Promise<MemoryEntry[]> {
    try {
      const content = await fs.readFile(getMemoryPath(), "utf-8")
      return JSON.parse(content)
    } catch {
      return []
    }
  }

  async function saveMemoryFile(entries: MemoryEntry[]): Promise<void> {
    const dir = path.dirname(getMemoryPath())
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(getMemoryPath(), JSON.stringify(entries, null, 2))
  }

  export const load = fn(zod({}), async () => {
    const s = yield* state()
    const ctx = yield* InstanceState.context
    const cwd = ctx.directory

    // Load LEGION.md if not cached
    if (s.legionMdContent === null) {
      s.legionMdContent = await loadLegionMd(cwd)
    }

    // Load memory entries if empty
    if (s.entries.size === 0) {
      const entries = await loadMemoryFile()
      for (const entry of entries) {
        s.entries.set(entry.key, entry)
      }
    }

    const entries = Array.from(s.entries.values())
    const legionMd = s.legionMdContent

    return { entries, legionMd }
  })

  export const save = fn(
    zod({
      key: zod.string(),
      content: zod.string(),
      source: zod.enum(["user", "auto"]).optional(),
    }),
    async (input) => {
      const s = yield* state()

      const entry: MemoryEntry = {
        key: input.key,
        content: input.content,
        source: input.source || "user",
        timestamp: Date.now(),
      }

      s.entries.set(entry.key, entry)

      // Persist to file
      const entries = Array.from(s.entries.values())
      await saveMemoryFile(entries)

      log.info("saved memory", { key: entry.key })
      return entry
    },
  )

  export const remove = fn(zod({ key: zod.string() }), async (input) => {
    const s = yield* state()
    s.entries.delete(input.key)

    const entries = Array.from(s.entries.values())
    await saveMemoryFile(entries)

    log.info("removed memory", { key: input.key })
    return true
  })

  export const list = fn(zod({}), async () => {
    const s = yield* state()

    if (s.entries.size === 0) {
      const entries = await loadMemoryFile()
      for (const entry of entries) {
        s.entries.set(entry.key, entry)
      }
    }

    return Array.from(s.entries.values())
  })

  export const formatContext = fn(zod({}), async () => {
    const { entries, legionMd } = yield* load()

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
  })

  export const autoSaveLearnings = fn(zod({ learnings: zod.array(zod.string()) }), async (input) => {
    for (const learning of input.learnings) {
      const key = `learning-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      await save({ key, content: learning, source: "auto" })
    }
    return input.learnings.length
  })
}
