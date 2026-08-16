import { describe, expect, test } from "bun:test"
import fs from "fs/promises"
import path from "path"
import { LegionSessionPrompt } from "../../src/kilocode/session/prompt"
import { tmpdir } from "../fixture/fixture"

describe("LegionSessionPrompt.ensurePlanDir", () => {
  test("creates a missing plan directory", async () => {
    await using tmp = await tmpdir({})
    const dir = path.join(tmp.path, ".kilocodecodecode", "plans")
    await LegionSessionPrompt.ensurePlanDir(dir)
    const stat = await fs.stat(dir)
    expect(stat.isDirectory()).toBe(true)
  })

  test("is idempotent when the directory already exists", async () => {
    await using tmp = await tmpdir({})
    const dir = path.join(tmp.path, ".kilocodecodecode", "plans")
    await fs.mkdir(dir, { recursive: true })
    await expect(LegionSessionPrompt.ensurePlanDir(dir)).resolves.toBeUndefined()
    const stat = await fs.stat(dir)
    expect(stat.isDirectory()).toBe(true)
  })

  test("creates intermediate parent directories", async () => {
    await using tmp = await tmpdir({})
    const dir = path.join(tmp.path, "deep", "nested", ".kilocodecodecode", "plans")
    await LegionSessionPrompt.ensurePlanDir(dir)
    const stat = await fs.stat(dir)
    expect(stat.isDirectory()).toBe(true)
  })
})
