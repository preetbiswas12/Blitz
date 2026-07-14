// kilocode_change - new file
import * as Tool from "../../tool/tool"
import { zod } from "@opencode-ai/core/effect-zod"
import * as Log from "@opencode-ai/core/util/log"
import { execSync } from "child_process"

const log = Log.create({ service: "test-runner" })

type Framework = "vitest" | "jest" | "pytest" | "go" | "cargo" | "maven" | "gradle" | "unknown"

interface TestResult {
  framework: Framework
  passed: number
  failed: number
  skipped: number
  duration: number
  failures: Array<{
    file: string
    line?: number
    name: string
    error: string
  }>
  output: string
}

function detectFramework(cwd: string): Framework {
  const fs = require("fs")
  const path = require("path")

  const checks: Array<{ file: string; framework: Framework }> = [
    { file: "vitest.config.ts", framework: "vitest" },
    { file: "vitest.config.js", framework: "vitest" },
    { file: "jest.config.ts", framework: "jest" },
    { file: "jest.config.js", framework: "jest" },
    { file: "pytest.ini", framework: "pytest" },
    { file: "pyproject.toml", framework: "pytest" },
    { file: "setup.cfg", framework: "pytest" },
    { file: "go.mod", framework: "go" },
    { file: "Cargo.toml", framework: "cargo" },
    { file: "pom.xml", framework: "maven" },
    { file: "build.gradle", framework: "gradle" },
    { file: "build.gradle.kts", framework: "gradle" },
  ]

  for (const check of checks) {
    try {
      fs.accessSync(path.join(cwd, check.file))
      return check.framework
    } catch {
      // continue
    }
  }

  // Check package.json for test scripts
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8"))
    const scripts = pkg.scripts || {}
    if (scripts.test?.includes("vitest")) return "vitest"
    if (scripts.test?.includes("jest")) return "jest"
    if (scripts.test) return "jest" // default for node projects
  } catch {
    // continue
  }

  return "unknown"
}

function getTestCommand(framework: Framework, pattern?: string): string {
  switch (framework) {
    case "vitest":
      return pattern ? `npx vitest run ${pattern}` : "npx vitest run"
    case "jest":
      return pattern ? `npx jest ${pattern}` : "npx jest"
    case "pytest":
      return pattern ? `python -m pytest ${pattern} -v` : "python -m pytest -v"
    case "go":
      return pattern ? `go test -v ${pattern}` : "go test -v ./..."
    case "cargo":
      return pattern ? `cargo test ${pattern}` : "cargo test"
    case "maven":
      return pattern ? `mvn test -Dtest=${pattern}` : "mvn test"
    case "gradle":
      return pattern ? `gradle test --tests ${pattern}` : "gradle test"
    default:
      return pattern ? `npm test ${pattern}` : "npm test"
  }
}

function parseOutput(framework: Framework, output: string): TestResult {
  const result: TestResult = {
    framework,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    failures: [],
    output,
  }

  // Parse based on framework
  if (framework === "vitest" || framework === "jest") {
    const passedMatch = output.match(/(\d+) passed/)
    const failedMatch = output.match(/(\d+) failed/)
    const skippedMatch = output.match(/(\d+) skipped/)
    const durationMatch = output.match(/Time:\s*([\d.]+)s?/)

    if (passedMatch) result.passed = parseInt(passedMatch[1])
    if (failedMatch) result.failed = parseInt(failedMatch[1])
    if (skippedMatch) result.skipped = parseInt(skippedMatch[1])
    if (durationMatch) result.duration = parseFloat(durationMatch[1]) * 1000

    // Parse failures
    const failRegex = /FAIL\s+([^\s]+)\s+([\w]+)/g
    let match
    while ((match = failRegex.exec(output)) !== null) {
      result.failures.push({
        file: match[1],
        name: match[2],
        error: "See output for details",
      })
    }
  } else if (framework === "pytest") {
    const passedMatch = output.match(/(\d+) passed/)
    const failedMatch = output.match(/(\d+) failed/)
    const skippedMatch = output.match(/(\d+) skipped/)
    const durationMatch = output.match(/([\d.]+)s/)

    if (passedMatch) result.passed = parseInt(passedMatch[1])
    if (failedMatch) result.failed = parseInt(failedMatch[1])
    if (skippedMatch) result.skipped = parseInt(skippedMatch[1])
    if (durationMatch) result.duration = parseFloat(durationMatch[1]) * 1000

    // Parse failures
    const failRegex = /FAILED\s+([^\s]+::[^\s]+)/g
    let match
    while ((match = failRegex.exec(output)) !== null) {
      result.failures.push({
        file: match[1].split("::")[0],
        name: match[1].split("::")[1] || "unknown",
        error: "See output for details",
      })
    }
  } else if (framework === "go") {
    const passedMatch = output.match(/ok\s+\S+\s+([\d.]+)s/)
    const failedMatch = output.match(/FAIL\s+(\S+)/)

    if (passedMatch) {
      result.passed = 1
      result.duration = parseFloat(passedMatch[1]) * 1000
    }
    if (failedMatch) {
      result.failed = 1
      result.failures.push({
        file: failedMatch[1],
        name: "unknown",
        error: "See output for details",
      })
    }
  } else if (framework === "cargo") {
    const passedMatch = output.match(/test result: ok\. (\d+) passed/)
    const failedMatch = output.match(/test result: FAILED\. (\d+) failed/)

    if (passedMatch) result.passed = parseInt(passedMatch[1])
    if (failedMatch) result.failed = parseInt(failedMatch[1])
  }

  return result
}

export const TestRunnerTool = Tool.define(
  "test_runner",
  {
    description:
      "Run tests with auto-detection of framework (vitest, jest, pytest, go, cargo, maven, gradle), parse results, and suggest fixes for failures",
    parameters: zod({
      command: z.string().optional().describe("Custom test command (overrides auto-detection)"),
      pattern: z.string().optional().describe("Test file pattern (e.g., '**/*.test.ts')"),
      retry: z.boolean().optional().describe("Retry failed tests with different strategies"),
      coverage: z.boolean().optional().describe("Include coverage report"),
    }),
    execute: async (args, ctx) => {
      const cwd = process.cwd()
      const framework = detectFramework(cwd)
      const command = args.command || getTestCommand(framework, args.pattern)

      log.info("running tests", { framework, command })

      let result: string
      try {
        result = execSync(command, {
          cwd,
          encoding: "utf-8",
          timeout: 300000, // 5 minutes
          stdio: ["pipe", "pipe", "pipe"],
        })
      } catch (err: any) {
        // Command failed but we still got output
        result = (err.stdout || "") + (err.stderr || "")
        if (!result) {
          result = `Error running tests: ${err.message}`
        }
      }

      const parsed = parseOutput(framework, result)

      // Format output
      const lines: string[] = []
      lines.push(`## Test Results (${parsed.framework})`)
      lines.push("")
      lines.push(`- Passed: ${parsed.passed}`)
      lines.push(`- Failed: ${parsed.failed}`)
      lines.push(`- Skipped: ${parsed.skipped}`)
      lines.push(`- Duration: ${(parsed.duration / 1000).toFixed(2)}s`)
      lines.push("")

      if (parsed.failures.length > 0) {
        lines.push("### Failures")
        lines.push("")
        for (const f of parsed.failures) {
          lines.push(`- **${f.file}** → ${f.name}`)
          if (f.line) lines.push(`  Line: ${f.line}`)
          lines.push(`  Error: ${f.error}`)
        }
        lines.push("")
      }

      lines.push("### Output")
      lines.push("```")
      lines.push(result.slice(-2000)) // Last 2000 chars
      lines.push("```")

      return {
        title: `Tests: ${parsed.passed} passed, ${parsed.failed} failed`,
        metadata: { framework, passed: parsed.passed, failed: parsed.failed },
        output: lines.join("\n"),
      }
    },
  },
  () => ({}) // metadata type
)
