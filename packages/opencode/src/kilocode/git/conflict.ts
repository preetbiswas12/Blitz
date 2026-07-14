// kilocode_change - new file
import * as Tool from "../../tool/tool"
import { Schema } from "effect"
import { zod } from "@opencode-ai/core/effect-zod"
import { Effect } from "effect"
import * as Log from "@opencode-ai/core/util/log"
import * as fs from "fs/promises"
import * as path from "path"

const log = Log.create({ service: "git-conflict" })

interface ConflictMarker {
  start: number
  middle: number
  end: number
  ours: string
  theirs: string
}

function parseConflictMarkers(content: string): ConflictMarker[] {
  const markers: ConflictMarker[] = []
  const lines = content.split("\n")

  let i = 0
  while (i < lines.length) {
    if (lines[i].startsWith("<<<<<<<")) {
      const start = i
      i++
      const ours: string[] = []
      while (i < lines.length && !lines[i].startsWith("=======")) {
        ours.push(lines[i])
        i++
      }
      const middle = i
      i++ // skip =======
      const theirs: string[] = []
      while (i < lines.length && !lines[i].startsWith(">>>>>>>")) {
        theirs.push(lines[i])
        i++
      }
      const end = i

      markers.push({
        start,
        middle,
        end,
        ours: ours.join("\n"),
        theirs: theirs.join("\n"),
      })
    }
    i++
  }

  return markers
}

function resolveWithStrategy(
  content: string,
  strategy: "ours" | "theirs" | "manual",
): string {
  const markers = parseConflictMarkers(content)
  if (markers.length === 0) return content

  const lines = content.split("\n")
  const result: string[] = []

  let lastEnd = 0
  for (const marker of markers) {
    // Add lines before conflict
    result.push(...lines.slice(lastEnd, marker.start))

    if (strategy === "ours") {
      result.push(marker.ours)
    } else if (strategy === "theirs") {
      result.push(marker.theirs)
    } else {
      // manual - keep both with markers
      result.push("<<<<<<< RESOLVED MANUALLY")
      result.push(marker.ours)
      result.push("=======")
      result.push(marker.theirs)
      result.push(">>>>>>>")
    }

    lastEnd = marker.end + 1
  }

  // Add remaining lines
  result.push(...lines.slice(lastEnd))

  return result.join("\n")
}

export const GitConflictResolveTool = Tool.define(
  "git_conflict_resolve",
  {
    description:
      "Resolve merge conflicts in a file using a specified strategy (ours, theirs, or manual)",
    parameters: zod(Schema.Struct({
      file: Schema.String.describe("Path to the file with conflicts"),
      strategy: Schema.optional(Schema.String).describe("Resolution strategy (default: ours)"),
    })),
    execute: async (args, ctx) => {
      const cwd = process.cwd()
      const filePath = path.resolve(cwd, args.file)
      const strategy = args.strategy || "ours"

      log.info("resolving conflicts", { file: args.file, strategy })

      try {
        // Read the file
        const content = await fs.readFile(filePath, "utf-8")

        // Check for conflict markers
        const markers = parseConflictMarkers(content)
        if (markers.length === 0) {
          return {
            title: "No conflicts found",
            metadata: { file: args.file },
            output: `No conflict markers found in ${args.file}.`,
          }
        }

        // Resolve conflicts
        const resolved = resolveWithStrategy(content, strategy)

        // Write resolved file
        await fs.writeFile(filePath, resolved)

        return {
          title: "Conflicts resolved",
          metadata: { file: args.file, strategy, conflicts: markers.length },
          output: `Resolved ${markers.length} conflict(s) in ${args.file} using '${strategy}' strategy.`,
        }
      } catch (err) {
        return {
          title: "Error resolving conflicts",
          metadata: { file: args.file },
          output: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        }
      }
    },
  },
  () => ({})
)

export const GitConflictListTool = Tool.define(
  "git_conflict_list",
  {
    description: "List all files with merge conflicts in the current repository",
    parameters: zod(Schema.Struct({})),
    execute: async (args, ctx) => {
      const cwd = process.cwd()

      try {
        const { execSync } = await import("child_process")
        const output = execSync("git diff --name-only --diff-filter=U", {
          cwd,
          encoding: "utf-8",
        })

        const files = output.trim().split("\n").filter((f) => f.trim())

        if (files.length === 0) {
          return {
            title: "No conflicts",
            metadata: { count: 0 },
            output: "No merge conflicts found.",
          }
        }

        return {
          title: `${files.length} file(s) with conflicts`,
          metadata: { count: files.length },
          output: `Files with merge conflicts:\n${files.map((f) => `- ${f}`).join("\n")}`,
        }
      } catch (err) {
        return {
          title: "Error listing conflicts",
          metadata: {},
          output: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        }
      }
    },
  },
  () => ({})
)
