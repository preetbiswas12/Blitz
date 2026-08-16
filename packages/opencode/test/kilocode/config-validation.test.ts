// kilocode_change - new file
import { afterEach, describe, expect, test } from "bun:test"
import path from "path"
import { Effect, Layer } from "effect"
import { ConfigValidation } from "../../src/kilocode/config-validation"
import { provideTestInstance } from "../fixture/fixture"
import { Config } from "../../src/config/config"
import { AppRuntime } from "../../src/effect/app-runtime"
import { Filesystem } from "../../src/util/filesystem"
import { disposeAllInstances, tmpdir } from "../fixture/fixture"
import { InstanceRef } from "../../src/effect/instance-ref"

afterEach(async () => {
  await disposeAllInstances()
})

const check = (filepath: string) => ConfigValidation.check(filepath)

describe("ConfigValidation.check", () => {
  test("returns empty string for non-config files", async () => {
    await using tmp = await tmpdir({ git: true })
    const filepath = path.join(tmp.path, "src", "index.ts")
    await Filesystem.write(filepath, "export const x = 1")

    const result = await provideTestInstance({
      directory: tmp.path,
      fn: (ctx) => check(filepath).then((r) => Effect.runPromise(Effect.succeed(r).pipe(Effect.provideService(InstanceRef, ctx)))),
    })
    expect(result).toBe("")
  })

  test("validates valid JSONC config", async () => {
    await using tmp = await tmpdir({ git: true })
    const filepath = path.join(tmp.path, "legion.json")
    await Filesystem.write(filepath, JSON.stringify({ model: "anthropic/claude-sonnet-4-20250514" }))

    const result = await provideTestInstance({
      directory: tmp.path,
      fn: (ctx) => check(filepath).then((r) => Effect.runPromise(Effect.succeed(r).pipe(Effect.provideService(InstanceRef, ctx)))),
    })
    expect(result).toContain("config_validation")
    expect(result).toContain("validated successfully")
  })

  test("reports JSONC syntax errors", async () => {
    await using tmp = await tmpdir({ git: true })
    const filepath = path.join(tmp.path, "legion.json")
    await Filesystem.write(filepath, '{ "model": "test/model" "extra": true }')

    const result = await provideTestInstance({
      directory: tmp.path,
      fn: (ctx) => check(filepath).then((r) => Effect.runPromise(Effect.succeed(r).pipe(Effect.provideService(InstanceRef, ctx)))),
    })
    expect(result).toContain("config_validation")
    expect(result).toContain("ERROR")
    expect(result).toContain("not valid JSON(C)")
  })

  test("reports schema validation errors for unknown fields", async () => {
    await using tmp = await tmpdir({ git: true })
    const filepath = path.join(tmp.path, "legion.json")
    await Filesystem.write(filepath, JSON.stringify({ notAField: true }))

    const result = await provideTestInstance({
      directory: tmp.path,
      fn: (ctx) => check(filepath).then((r) => Effect.runPromise(Effect.succeed(r).pipe(Effect.provideService(InstanceRef, ctx)))),
    })
    expect(result).toContain("config_validation")
    expect(result).toContain("WARNING")
    expect(result).toContain("invalid")
  })

  test("validates valid markdown command", async () => {
    await using tmp = await tmpdir({ git: true })
    const filepath = path.join(tmp.path, ".kilocode", "command", "test-cmd.md")
    await Filesystem.write(
      filepath,
      `---
description: A test command
---
Do something useful`,
    )

    const result = await provideTestInstance({
      directory: tmp.path,
      fn: (ctx) => check(filepath).then((r) => Effect.runPromise(Effect.succeed(r).pipe(Effect.provideService(InstanceRef, ctx)))),
    })
    expect(result).toContain("config_validation")
    expect(result).toContain("validated successfully")
  })

  test("reports schema error for command with invalid field types", async () => {
    await using tmp = await tmpdir({ git: true })
    const filepath = path.join(tmp.path, ".kilocode", "command", "bad.md")
    await Filesystem.write(
      filepath,
      `---
agent: 123
subtask: "not-a-boolean"
---
Do something`,
    )

    const result = await provideTestInstance({
      directory: tmp.path,
      fn: (ctx) => check(filepath).then((r) => Effect.runPromise(Effect.succeed(r).pipe(Effect.provideService(InstanceRef, ctx)))),
    })
    expect(result).toContain("config_validation")
    expect(result).toContain("WARNING")
    expect(result).toContain("invalid")
  })

  test("validates valid markdown agent", async () => {
    await using tmp = await tmpdir({ git: true })
    const filepath = path.join(tmp.path, ".kilocode", "agent", "helper.md")
    await Filesystem.write(
      filepath,
      `---
model: anthropic/claude-sonnet-4-20250514
description: A helper agent
---
You are a helpful agent.`,
    )

    const result = await provideTestInstance({
      directory: tmp.path,
      fn: (ctx) => check(filepath).then((r) => Effect.runPromise(Effect.succeed(r).pipe(Effect.provideService(InstanceRef, ctx)))),
    })
    expect(result).toContain("config_validation")
    expect(result).toContain("validated successfully")
  })

  test("skips AGENTS.md (root md file not in config subdir)", async () => {
    await using tmp = await tmpdir({ git: true })
    const filepath = path.join(tmp.path, "AGENTS.md")
    await Filesystem.write(filepath, "# Project agents")

    const result = await provideTestInstance({
      directory: tmp.path,
      fn: (ctx) => check(filepath).then((r) => Effect.runPromise(Effect.succeed(r).pipe(Effect.provideService(InstanceRef, ctx)))),
    })
    expect(result).toBe("")
  })

  test("skips plan files (excluded subdir)", async () => {
    await using tmp = await tmpdir({ git: true })
    const filepath = path.join(tmp.path, ".kilocode", "plans", "plan.md")
    await Filesystem.write(filepath, "# Plan")

    const result = await provideTestInstance({
      directory: tmp.path,
      fn: (ctx) => check(filepath).then((r) => Effect.runPromise(Effect.succeed(r).pipe(Effect.provideService(InstanceRef, ctx)))),
    })
    expect(result).toBe("")
  })

  test("includes pre-existing warnings when present", async () => {
    await using tmp = await tmpdir({
      git: true,
      init: async (dir) => {
        await Filesystem.write(
          path.join(dir, ".kilocode", "agent", "broken.md"),
          `---
mode: "banana"
---
Broken agent`,
        )
      },
    })

    const filepath = path.join(tmp.path, "legion.json")
    await Filesystem.write(filepath, JSON.stringify({ model: "anthropic/claude-sonnet-4-20250514" }))

    const result = await provideTestInstance({
      directory: tmp.path,
      fn: async (ctx) => {
        await AppRuntime.runPromise(Config.Service.use((svc) => svc.get()).pipe(Effect.provideService(InstanceRef, ctx)))
        return check(filepath)
      },
    })
    expect(result).toContain("Pre-existing config issues")
    expect(result).toContain("broken.md")
    expect(result).toContain("Post-edit validation")
  })
})
