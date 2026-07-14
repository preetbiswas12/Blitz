// kilocode_change - new file
import { Effect, Context, Layer, Ref } from "effect"
import * as Log from "@opencode-ai/core/util/log"
import * as fs from "fs/promises"
import * as path from "path"

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
  readonly load: (cwd: string) => Effect.Effect<{ entries: MemoryEntry[]; legionMd: string | null }>
  readonly save: (input: { key: string; content: string; source?: "user" | "auto" }) => Effect.Effect<MemoryEntry>
  readonly remove: (input: { key: string }) => Effect.Effect<boolean>
  readonly list: Effect.Effect<MemoryEntry[]>
  readonly formatContext: (cwd: string) => Effect.Effect<string>
  readonly autoSaveLearnings: (input: { learnings: string[] }) => Effect.Effect<number>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/Memory") {}

function initialState(): MemoryState {
  return {
    entries: new Map(),
    legionMdContent: null,
  }
}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const ref = yield* Ref.make(initialState())

    const load = (cwd: string) =>
      Effect.fn("Memory.load")(function* () {
        const s = yield* Ref.get(ref)

        if (s.legionMdContent === null) {
          const content = yield* Effect.promise(() => loadLegionMd(cwd))
          yield* Ref.update(ref, (prev) => ({ ...prev, legionMdContent: content }))
        }

        if (s.entries.size === 0) {
          const entries = yield* Effect.promise(() => loadMemoryFile())
          const updated = new Map(s.entries)
          for (const entry of entries) {
            updated.set(entry.key, entry)
          }
          yield* Ref.update(ref, (prev) => ({ ...prev, entries: updated }))
        }

        const current = yield* Ref.get(ref)
        return { entries: Array.from(current.entries.values()), legionMd: current.legionMdContent }
      })()

    const save = Effect.fn("Memory.save")(function* (input: {
      key: string
      content: string
      source?: "user" | "auto"
    }) {
      const entry: MemoryEntry = {
        key: input.key,
        content: input.content,
        source: input.source || "user",
        timestamp: Date.now(),
      }

      const s = yield* Ref.get(ref)
      const updated = new Map(s.entries)
      updated.set(entry.key, entry)
      yield* Ref.update(ref, (prev) => ({ ...prev, entries: updated }))

      yield* Effect.promise(() => saveMemoryFile(Array.from(updated.values())))
      log.info("saved memory", { key: entry.key })
      return entry
    })

    const remove = Effect.fn("Memory.remove")(function* (input: { key: string }) {
      const s = yield* Ref.get(ref)
      const updated = new Map(s.entries)
      updated.delete(input.key)
      yield* Ref.update(ref, (prev) => ({ ...prev, entries: updated }))

      yield* Effect.promise(() => saveMemoryFile(Array.from(updated.values())))
      log.info("removed memory", { key: input.key })
      return true
    })

    const list = Effect.fn("Memory.list")(function* () {
      const s = yield* Ref.get(ref)

      if (s.entries.size === 0) {
        const entries = yield* Effect.promise(() => loadMemoryFile())
        const updated = new Map(s.entries)
        for (const entry of entries) {
          updated.set(entry.key, entry)
        }
        yield* Ref.update(ref, (prev) => ({ ...prev, entries: updated }))
        return entries
      }

      return Array.from(s.entries.values())
    })

    const formatContext = (cwd: string) =>
      Effect.fn("Memory.formatContext")(function* () {
        const { entries, legionMd } = yield* load(cwd)

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
      })()

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

export const defaultLayer = layer

export * as Memory from "./index"
