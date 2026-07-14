// kilocode_change - new file
import * as Tool from "../../tool/tool"
import { Schema } from "effect"
import { zod } from "@opencode-ai/core/effect-zod"
import * as Log from "@opencode-ai/core/util/log"
import { execSync } from "child_process"

const log = Log.create({ service: "git-blame" })

interface BlameLine {
  commit: string
  author: string
  date: string
  line: number
  content: string
}

function parseBlameOutput(output: string): BlameLine[] {
  const lines: BlameLine[] = []
  const blameRegex = /^\^?([0-9a-f]{8})\s+\((.+?)\s+(\d{4}-\d{2}-\d{2})\s+(\d+)\)\s+(.*)$/

  for (const line of output.split("\n")) {
    const match = line.match(blameRegex)
    if (match) {
      lines.push({
        commit: match[1],
        author: match[2],
        date: match[3],
        line: parseInt(match[4]),
        content: match[5],
      })
    }
  }

  return lines
}

export const GitBlameTool = Tool.define(
  "git_blame",
  {
    description: "Show git blame for a file, displaying who last modified each line",
    parameters: zod(Schema.Struct({
      file: Schema.String.annotate({ description: "Path to the file to blame" }),
      line: Schema.optional(Schema.Number).annotate({ description: "Show blame for a specific line number" }),
      range: Schema.optional(Schema.String).annotate({ description: "Line range (e.g., '10-20')" }),
    })),
    execute: async (args, ctx) => {
      const cwd = process.cwd()

      log.info("running git blame", { file: args.file, line: args.line })

      try {
        let command = `git blame -l ${args.file}`
        if (args.range) {
          command += ` -L ${args.range}`
        } else if (args.line) {
          command += ` -L ${args.line},${args.line}`
        }

        const output = execSync(command, {
          cwd,
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        })

        const blameLines = parseBlameOutput(output)

        if (blameLines.length === 0) {
          return {
            title: "No blame data",
            metadata: { file: args.file },
            output: `No blame data found for ${args.file}.`,
          }
        }

        // Group by commit
        const byCommit = new Map<string, BlameLine[]>()
        for (const line of blameLines) {
          const existing = byCommit.get(line.commit) || []
          existing.push(line)
          byCommit.set(line.commit, existing)
        }

        const lines: string[] = []
        lines.push(`## Git Blame: ${args.file}`)
        lines.push("")

        // Summary
        lines.push("### Summary")
        lines.push("")
        for (const [commit, commitLines] of byCommit) {
          const author = commitLines[0].author
          const date = commitLines[0].date
          lines.push(`- **${commit}** by ${author} (${date}): ${commitLines.length} line(s)`)
        }
        lines.push("")

        // Detailed view
        lines.push("### Detailed View")
        lines.push("")
        for (const line of blameLines) {
          lines.push(`${line.line}\t${line.commit}\t${line.author}\t${line.content}`)
        }

        return {
          title: `Blame: ${args.file}`,
          metadata: { file: args.file, lines: blameLines.length },
          output: lines.join("\n"),
        }
      } catch (err) {
        return {
          title: "Error running git blame",
          metadata: { file: args.file },
          output: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        }
      }
    },
  },
  () => ({})
)
