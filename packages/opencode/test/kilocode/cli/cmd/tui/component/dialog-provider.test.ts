import { describe, expect, test } from "bun:test"
import {
  PROVIDER_DESCRIPTIONS,
  PROVIDER_PRIORITY,
  PROVIDER_TITLES,
  consoleManagedFooter,
  consoleManagedMessage,
  openAuthorization,
} from "@/kilocode/cli/cmd/tui/component/dialog-provider"

describe("opencode zen provider entry", () => {
  test("is listed in the connect dialog with a sign-in hint", () => {
    expect(PROVIDER_TITLES.opencode).toBe("OpenCode Zen")
    expect(PROVIDER_DESCRIPTIONS.opencode).toBe("(OpenCode account or API key)")
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

describe("console-managed provider rows", () => {
  // The dialog refuses to open a credential flow for these, so the row has to
  // explain itself or selecting it looks like a dead keypress.
  test("names the owning org when the account reports one", () => {
    const message = consoleManagedMessage({ title: "OpenCode Zen", orgName: "Personal / OpenCode" })
    expect(message).toContain("Personal / OpenCode")
    expect(message).toContain("OpenCode Zen")
    expect(consoleManagedFooter("Personal / OpenCode")).toBe("Personal / OpenCode")
  })

  test("still explains itself when the account has no org name", () => {
    // the server omits activeOrgName entirely in this case, leaving no footer
    const message = consoleManagedMessage({ title: "OpenCode Zen" })
    expect(message).toContain("OpenCode Zen")
    expect(message).toContain("console account")
    expect(consoleManagedFooter(undefined)).toBe("Managed by console")
  })
})
