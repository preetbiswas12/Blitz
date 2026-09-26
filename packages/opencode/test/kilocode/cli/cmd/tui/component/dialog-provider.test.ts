import { describe, expect, test } from "bun:test"
import {
  PROVIDER_DESCRIPTIONS,
  PROVIDER_PRIORITY,
  PROVIDER_TITLES,
  openAuthorization,
} from "@/kilocode/cli/cmd/tui/component/dialog-provider"

describe("opencode zen provider entry", () => {
  test("is listed in the connect dialog with a free-model description", () => {
    expect(PROVIDER_TITLES.opencode).toBe("OpenCode Zen")
    expect(PROVIDER_DESCRIPTIONS.opencode).toBe("(Free models with an OpenCode account)")
  })

  test("sorts after the major providers and before local models", () => {
    expect(PROVIDER_PRIORITY.opencode).toBeGreaterThan(PROVIDER_PRIORITY.google)
    expect(PROVIDER_PRIORITY.opencode).toBeLessThan(PROVIDER_PRIORITY["anaconda-desktop"])
  })

  test("does not open a browser for other providers", () => {
    expect(() => openAuthorization("anthropic", "https://console.anthropic.com")).not.toThrow()
    expect(() => openAuthorization("opencode", undefined)).not.toThrow()
  })
})
