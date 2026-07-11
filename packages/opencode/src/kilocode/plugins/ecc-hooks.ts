// kilocode_change - new file
// ECC (Everything Claude Code) hooks ported to Legion's plugin system.
// Provides config protection, doc file warnings, and quality gates.

import type { Hooks } from "@legion/plugin"
import path from "path"
import fs from "fs"

const CONFIG_PATTERNS = [
  // ESLint
  ".eslintrc",
  ".eslintrc.js",
  ".eslintrc.cjs",
  ".eslintrc.mjs",
  ".eslintrc.json",
  ".eslintrc.yml",
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  // Prettier
  ".prettierrc",
  ".prettierrc.js",
  ".prettierrc.cjs",
  ".prettierrc.mjs",
  ".prettierrc.json",
  ".prettierrc.yml",
  ".prettierrc.toml",
  "prettier.config.js",
  "prettier.config.mjs",
  "prettier.config.cjs",
  // Biome
  "biome.json",
  "biome.jsonc",
  // Ruff
  ".ruff.toml",
  "ruff.toml",
  // ShellCheck
  ".shellcheckrc",
  // Stylelint
  ".stylelintrc",
  ".stylelintrc.js",
  ".stylelintrc.json",
  "stylelint.config.js",
  // Markdownlint
  ".markdownlint.json",
  ".markdownlint.yaml",
  ".markdownlintrc",
]

const DOC_WARNING_NAMES = [
  "NOTES",
  "TODO",
  "SCRATCH",
  "TEMP",
  "DRAFT",
  "BRAINSTORM",
  "SPIKE",
  "DEBUG",
  "WIP",
]

const ALLOWED_DIRS = [
  "docs",
  ".claude",
  ".github",
  "commands",
  "skills",
  "benchmarks",
  "templates",
  ".history",
  "memory",
  ".legion",
  ".kilocode",
]

function isConfigFile(filePath: string): boolean {
  const basename = path.basename(filePath)
  return CONFIG_PATTERNS.some((pattern) => basename === pattern || basename.startsWith(pattern + "."))
}

function isDocWarningFile(filePath: string): boolean {
  const basename = path.basename(filePath)
  const nameWithoutExt = basename.replace(/\.(md|txt)$/, "")

  if (!DOC_WARNING_NAMES.includes(nameWithoutExt.toUpperCase())) return false

  // Allow inside structured directories
  const dir = path.dirname(filePath)
  const parts = dir.split(path.sep)
  if (parts.some((p) => ALLOWED_DIRS.includes(p))) return false

  return true
}

export function eccHooks(opts?: { enabled?: boolean }): Hooks {
  if (opts?.enabled === false) return {}

  return {
    "tool.execute.before": async (input, output) => {
      // Config protection: block edits to linter/formatter configs
      if (input.tool === "edit" || input.tool === "write") {
        const filePath = output.args?.path ?? output.args?.filePath ?? ""
        if (filePath && isConfigFile(filePath)) {
          // Allow creation (file doesn't exist yet)
          if (fs.existsSync(filePath)) {
            output.args.__blocked = true
            output.args.__blockReason =
              `Blocked: ${path.basename(filePath)} is a linter/formatter config file. ` +
              `Fix the source code instead of weakening the config. ` +
              `If you truly need to modify this config, remove it from the ECC protection list first.`
          }
        }
      }

      // Doc file warning: warn on ad-hoc doc filenames
      if (input.tool === "write") {
        const filePath = output.args?.path ?? output.args?.filePath ?? ""
        if (filePath && isDocWarningFile(filePath)) {
          // Warn but don't block (exit code 0 equivalent)
          output.args.__warning =
            `Warning: You are creating "${path.basename(filePath)}". ` +
            `Consider using a structured location like docs/ or .legion/ instead.`
        }
      }
    },

    "tool.execute.after": async (input, output) => {
      // Quality gate: check for common issues after file edits
      if (input.tool === "edit" || input.tool === "write") {
        const filePath = input.args?.path ?? input.args?.filePath ?? ""
        if (!filePath) return

        // Warn if console.log/left in code
        if (filePath.endsWith(".ts") || filePath.endsWith(".js") || filePath.endsWith(".tsx") || filePath.endsWith(".jsx")) {
          const content = output.output ?? ""
          if (content.includes("console.log(") && !filePath.includes(".test.") && !filePath.includes(".spec.")) {
            output.output += "\n⚠️ Note: console.log detected in non-test file. Consider removing before commit."
          }
        }
      }
    },
  }
}
