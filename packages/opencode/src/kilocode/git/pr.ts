// kilocode_change - new file
import * as Tool from "../../tool/tool"
import { Effect, Schema } from "effect"
import * as Log from "@opencode-ai/core/util/log"
import { execSync } from "child_process"

const log = Log.create({ service: "git-pr" })

function execCommand(command: string, cwd: string): string {
  return execSync(command, {
    cwd,
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  })
}

function getCurrentBranch(cwd: string): string {
  const output = execCommand("git branch --show-current", cwd)
  return output.trim()
}

function hasUncommittedChanges(cwd: string): boolean {
  const output = execCommand("git status --porcelain", cwd)
  return output.trim().length > 0
}

function pushBranch(branch: string, cwd: string): void {
  execCommand(`git push -u origin ${branch}`, cwd)
}

function createPR(
  title: string,
  body: string | undefined,
  base: string | undefined,
  draft: boolean,
  cwd: string,
): string {
  const args = ["gh", "pr", "create", "--title", title]
  if (body) args.push("--body", body)
  if (base) args.push("--base", base)
  if (draft) args.push("--draft")

  return execCommand(args.join(" "), cwd)
}

export const GitPRCreateTool = Tool.define(
  "git_pr_create",
  Effect.succeed({
    description:
      "Create a GitHub PR from the current branch. Pushes the branch and creates a PR with title and optional body.",
    parameters: Schema.Struct({
      title: Schema.String.annotate({ description: "PR title" }),
      body: Schema.optional(Schema.String).annotate({ description: "PR description/body" }),
      base: Schema.optional(Schema.String).annotate({ description: "Base branch (default: main)" }),
      draft: Schema.optional(Schema.Boolean).annotate({ description: "Create as draft PR" }),
    }),
    execute: async (args, ctx) => {
      const cwd = process.cwd()

      // Check if we're in a git repo
      try {
        execCommand("git rev-parse --is-inside-work-tree", cwd)
      } catch {
        return {
          title: "Not a git repository",
          metadata: {},
          output: "Error: Not inside a git repository. Run `git init` first.",
        }
      }

      // Get current branch
      const branch = getCurrentBranch(cwd)

      // Check for uncommitted changes
      const hasChanges = hasUncommittedChanges(cwd)
      if (hasChanges) {
        return {
          title: "Uncommitted changes",
          metadata: { branch },
          output: `Error: You have uncommitted changes on branch '${branch}'. Please commit or stash them first.`,
        }
      }

      // Push branch
      log.info("pushing branch", { branch })
      pushBranch(branch, cwd)

      // Create PR
      log.info("creating PR", { title, branch })
      const prUrl = createPR(
        title,
        args.body,
        args.base || "main",
        args.draft ?? false,
        cwd,
      )

      return {
        title: "PR Created",
        metadata: { branch, prUrl },
        output: `PR created successfully!\n\nBranch: ${branch}\nURL: ${prUrl}`,
      }
    },
  }),
)

export const GitPRListTool = Tool.define(
  "git_pr_list",
  Effect.succeed({
    description: "List open GitHub PRs for the current repository",
    parameters: Schema.Struct({
      state: Schema.optional(Schema.String).annotate({ description: "PR state filter (default: open)" }),
      limit: Schema.optional(Schema.Number).annotate({ description: "Maximum number of PRs to show (default: 10)" }),
    }),
    execute: async (args, ctx) => {
      const cwd = process.cwd()

      try {
        const state = args.state || "open"
        const limit = args.limit || 10
        const output = execCommand(
          `gh pr list --state ${state} --limit ${limit}`,
          cwd,
        )

        return {
          title: `Open PRs (${state})`,
          metadata: { state, count: output.split("\n").filter((l) => l.trim()).length },
          output: output || "No PRs found.",
        }
      } catch (err) {
        return {
          title: "Error listing PRs",
          metadata: {},
          output: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        }
      }
    },
  }),
)
