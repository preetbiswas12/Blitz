import { describe, expect, test } from "bun:test"
import { KilocodeMcpConfig } from "@/kilocode/cli/cmd/mcp"

const added = `{
  "permission": {
    "bash": "allow"
  },
  "mcp": {
    "linear": {
      "type": "remote",
      "url": "https://mcp.linear.app/mcp",
      "oauth": {}
    }
  },
}`

describe("KilocodeMcpConfig.format", () => {
  test("writes strict JSON for legion.json", () => {
    const output = KilocodeMcpConfig.format("/tmp/legion.json", added)

    expect(JSON.parse(output)).toEqual({
      permission: { bash: "allow" },
      mcp: {
        linear: {
          type: "remote",
          url: "https://mcp.linear.app/mcp",
          oauth: {},
        },
      },
    })
    expect(output).not.toEndWith(",\n}")
  })

  test("preserves JSONC formatting for legion.jsonc", () => {
    expect(KilocodeMcpConfig.format("/tmp/legion.jsonc", added)).toBe(added)
  })
})
