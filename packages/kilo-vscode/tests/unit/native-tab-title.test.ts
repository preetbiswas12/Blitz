import { describe, expect, it } from "bun:test"
import type { Session } from "@blitxcode/sdk/v2/client"
import { nativeTitle } from "../../src/kilo-provider/native-tab-title"

const session = (title: string | null) => ({ title }) as Session

describe("nativeTitle", () => {
  it("uses the default title without a useful session title", () => {
    expect(nativeTitle(null)).toBe("Blitx Code")
    expect(nativeTitle(session(""))).toBe("Blitx Code")
    expect(nativeTitle(session("New session - 2026-05-06T10:39:00.000Z"))).toBe("Blitx Code")
  })

  it("keeps short session titles", () => {
    expect(nativeTitle(session("Greeting"))).toBe("Greeting")
  })

  it("truncates long session titles", () => {
    expect(nativeTitle(session("Dynamic VS Code tab titles for Blitx sessions"))).toBe("Dynamic VS Code tab...")
  })
})
