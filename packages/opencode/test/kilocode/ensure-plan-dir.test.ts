import { describe, expect, test } from "bun:test"
import fs from "fs/promises"
import path from "path"
import { LegionSessionrompt } from "../../src/kilocode/session/prompt"
import { tmpdir } from "../fixture/fixture"

describe("LegionSessionrompt.ensurePlanDir", () => {
  test("creates a missing plan directory", async () => {
    await using tmp = await tmpdir({})
    const dir = path.join(tmp.path, ".kilo", "plans")
    await LegionSessionrompt.ensurePlanDir(dir)
    const stat = await fs.stat(dir)
    expect(stat.isDirectory()).toBe(true)
  })

  test("is idempotent when the directory already exists", async () => {
    await using tmp = await tmpdir({})
    const dir = path.join(tmp.path, ".kilo", "plans")
    await fs.mkdir(dir, { recursive: true })
    await expect(LegionSessionrompt.ensurePlanDir(dir)).resolves.toBeUndefined()
    const stat = await fs.stat(dir)
    expect(stat.isDirectory()).toBe(true)
  })

  test("creates intermediate parent directories", async () => {
    await using tmp = await tmpdir({})
    const dir = path.join(tmp.path, "deep", "nested", ".kilo", "plans")
    await LegionSessionrompt.ensurePlanDir(dir)
    const stat = await fs.stat(dir)
    expect(stat.isDirectory()).toBe(true)
  })
})
