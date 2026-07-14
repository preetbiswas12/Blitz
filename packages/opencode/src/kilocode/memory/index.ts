// kilocode_change - new file
import { Effect, Context, Layer } from "effect"
import * as Log from "@opencode-ai/core/util/log"
import * as fs from "fs/promises"
import * as path from "path"
import { InstanceState } from "@/effect/instance-state"
import { Bus } from "@/bus"

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

export interface Interface {
  readonly load: Effect.Effect<{ entries: MemoryEntry[]; legionMd: string | null }>
  readonly save: (input: { key: string; content: string; source?: "user" | "auto" }) => Effect.Effect<MemoryEntry>
  readonly remove: (input: { key: string }) => Effect.Effect<boolean>
  readonly list: Effect.Effect<MemoryEntry[]>
  readonly formatContext: Effect.Effect<string>
  readonly autoSaveLearnings: (input: { learnings: string[] }) => Effect.Effect<number>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/Memory") {}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const ctx = yield* InstanceState.context
    const bus = yield* Bus.Service

    const state = yield* InstanceState.make<MemoryState>(
      Effect.fn("Memory.state")(() =>
        Effect.succeed({
          entries: new Map(),
          legionMdContent: null,
        }),
      ),
    )

    const load = Effect.fn("Memory.load")(function* () {
      const s = yield* InstanceState.get(state)
      const cwd = ctx.directory

      // Load LEGION.md if not cached
      if (s.legionMdContent === null) {
        s.legionMdContent = yield* Effect.promise(() => loadLegionMd(cwd))
      }

      // Load memory entries if empty
      if (s.entries.size === 0) {
        const entries = yield* Effect.promise(() => loadMemoryFile())
        for (const entry of entries) {
          s.entries.set(entry.key, entry)
        }
      }

      const entries = Array.from(s.entries.values())
      const legionMd = s.legionMdContent

      return { entries, legionMd }
    })

    const save = Effect.fn("Memory.save")(function* (input: {
      key: string
      content: string
      source?: "user" | "auto"
    }) {
      const s = yield* InstanceState.get(state)

      const entry: MemoryEntry = {
        key: input.key,
        content: input.content,
        source: input.source || "user",
        timestamp: Date.now(),
      }

      s.entries.set(entry.key, entry)

      // Persist to file
      const entries = Array.from(s.entries.values())
      yield* Effect.promise(() => saveMemoryFile(entries))

      log.info("saved memory", { key: entry.key })
      return entry
    })

    const remove = Effect.fn("Memory.remove")(function* (input: { key: string }) {
      const s = yield* InstanceState.get(state)
      s.entries.delete(input.key)

      // Persist to file
      const entries = Array.from(s.entries.values())
      yield* Effect.promise(() => saveMemoryFile(entries))

      log.info("removed memory", { key: input.key })
      return true
    })

    const list = Effect.fn("Memory.list")(function* () {
      const s = yield* InstanceState.get(state)

      if (s.entries.size === 0) {
        const entries = yield* Effect.promise(() => loadMemoryFile())
        for (const entry of entries) {
          s.entries.set(entry.key, entry)
        }
      }

      return Array.from(s.entries.values())
    })

    const formatContext = Effect.fn("Memory.formatContext")(function* () {
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

    const autoSaveLearnings = Effect.fn("Memory.autoSaveLearnings")(function* (input: {
      learnings: string[]
    }) {
      for (const learning of input.learnings) {
        const key = `learning-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        yield* save({ key, content: learning, source: "auto" })
      }
      return input.learnings.length
    })

    return Service.of({
      load,
      save,
      remove,
      list,
      formatContext,
      autoSaveLearnings,
    })
  }),
)

export const defaultLayer = layer.pipe(Layer.provide(Bus.layer))

export * as Memory from "./index"
