import { afterEach, describe, expect, test } from "bun:test"
import path from "path"
import { Effect, Layer } from "effect"
import { Config } from "../../src/config/config"
import { AppRuntime } from "../../src/effect/app-runtime"
import { provideTestInstance } from "../fixture/fixture"
import { Filesystem } from "../../src/util/filesystem"
import { disposeAllInstances, tmpdir } from "../fixture/fixture"
import { InstanceRef } from "../../src/effect/instance-ref"

const load = (ctx: any) => AppRuntime.runPromise(Config.Service.use((svc) => svc.get()).pipe(Effect.provideService(InstanceRef, ctx)))
const warnings = (ctx: any) => AppRuntime.runPromise(Config.Service.use((svc) => svc.warnings()).pipe(Effect.provideService(InstanceRef, ctx)))

afterEach(async () => {
  await disposeAllInstances()
})

describe("config resilience", () => {
  test("skips invalid agent markdown configs", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Filesystem.write(
          path.join(dir, ".kilocode", "agent", "skip.md"),
          `---
mode: "banana"
---
Broken agent prompt`,
        )
        await Filesystem.write(
          path.join(dir, ".kilocode", "agent", "keep.md"),
          `---
model: test/model
---
Valid agent prompt`,
        )
      },
    })

    await provideTestInstance({
      directory: tmp.path,
      fn: async (ctx) => {
        const cfg = await load(ctx)

        expect(cfg.agent?.["skip"]).toBeUndefined()
        expect(cfg.agent?.["keep"]).toMatchObject({
          name: "keep",
          model: "test/model",
          prompt: "Valid agent prompt",
        })
      },
    })
  })

  test("reports a warning for invalid agent markdown configs", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Filesystem.write(
          path.join(dir, ".kilocode", "agent", "skip.md"),
          `---
mode: "banana"
---
Broken agent prompt`,
        )
      },
    })

    await provideTestInstance({
      directory: tmp.path,
      fn: async (ctx) => {
        await load(ctx)
        const warns = await warnings(ctx)

        expect(warns.some((w: any) => w.path.includes("skip.md") && w.message.includes("mode"))).toBe(true)
      },
    })
  })

  test("skips invalid command markdown configs", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Filesystem.write(
          path.join(dir, ".kilocode", "command", "skip.md"),
          `---
subtask: "banana"
---
Broken command template`,
        )
        await Filesystem.write(
          path.join(dir, ".kilocode", "command", "keep.md"),
          `---
description: Valid command
---
Valid command template`,
        )
      },
    })

    await provideTestInstance({
      directory: tmp.path,
      fn: async (ctx) => {
        const cfg = await load(ctx)

        expect(cfg.command?.["skip"]).toBeUndefined()
        expect(cfg.command?.["keep"]).toEqual({
          description: "Valid command",
          template: "Valid command template",
        })
      },
    })
  })

  test("reports a warning for invalid command markdown configs", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Filesystem.write(
          path.join(dir, ".kilocode", "command", "skip.md"),
          `---
subtask: "banana"
---
Broken command template`,
        )
      },
    })

    await provideTestInstance({
      directory: tmp.path,
      fn: async (ctx) => {
        await load(ctx)
        const warns = await warnings(ctx)

        expect(warns.some((w: any) => w.path.includes("skip.md") && w.message.includes("subtask"))).toBe(true)
      },
    })
  })

  test("collects warnings for invalid agent markdown configs", async () => {
    await using tmp = await tmpdir({
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

    await provideTestInstance({
      directory: tmp.path,
      fn: async (ctx) => {
        await load(ctx)
        const warns = await warnings(ctx)

        expect(warns.some((w: any) => w.path.includes("broken.md") && w.message.includes("invalid"))).toBe(true)
      },
    })
  })

  test("collects warnings for invalid command markdown configs", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Filesystem.write(
          path.join(dir, ".kilocode", "command", "broken.md"),
          `---
subtask: "banana"
---
Broken command`,
        )
      },
    })

    await provideTestInstance({
      directory: tmp.path,
      fn: async (ctx) => {
        await load(ctx)
        const warns = await warnings(ctx)

        expect(warns.some((w: any) => w.path.includes("broken.md") && w.message.includes("invalid"))).toBe(true)
      },
    })
  })

  test("collects warnings for invalid JSON in .kilocode directory config", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Filesystem.write(path.join(dir, ".kilocode", "legion.json"), "{ not valid json !!!")
      },
    })

    await provideTestInstance({
      directory: tmp.path,
      fn: async (ctx) => {
        const cfg = await load(ctx)
        const warns = await warnings(ctx)

        expect(cfg).toBeDefined()
        expect(warns.some((w: any) => w.path.includes("legion.json") && w.message.includes("not valid JSON"))).toBe(true)
      },
    })
  })

  test("collects warnings for invalid schema in .kilocode directory config", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Filesystem.write(path.join(dir, ".kilocode", "legion.json"), JSON.stringify({ unknownField: true }))
      },
    })

    await provideTestInstance({
      directory: tmp.path,
      fn: async (ctx) => {
        const cfg = await load(ctx)
        const warns = await warnings(ctx)

        expect(cfg).toBeDefined()
        expect(warns.some((w: any) => w.path.includes("legion.json") && w.message.includes("invalid"))).toBe(true)
      },
    })
  })

  test("returns empty warnings when config is valid", async () => {
    await using tmp = await tmpdir({
      config: { model: "test/model" },
    })

    await provideTestInstance({
      directory: tmp.path,
      fn: async (ctx) => {
        await load(ctx)
        const warns = await warnings(ctx)

        expect(warns).toEqual([])
      },
    })
  })
})
