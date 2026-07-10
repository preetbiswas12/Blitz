// kilocode_change - new file
import { describe, expect, test } from "bun:test"
import { LegionSessionProcessor } from "../../src/kilocode/session/processor"
import type { MessageV2 } from "../../src/session/message-v2"

const REVIEW_COMMANDS = ["review"] as const

const expected = (command: (typeof REVIEW_COMMANDS)[number]) => ({
  mode: "review" as const,
  feature: "code_reviews" as const,
  command,
})

describe("LegionSessionProcessor.reviewTelemetry", () => {
  for (const command of REVIEW_COMMANDS) {
    test(`returns telemetry for ${command}`, () => {
      expect(LegionSessionProcessor.reviewTelemetry(command)).toEqual(expected(command))
    })
  }

  test("returns undefined for an unrelated command", () => {
    expect(LegionSessionProcessor.reviewTelemetry("init")).toBeUndefined()
  })

  test("returns undefined for an undefined command", () => {
    expect(LegionSessionProcessor.reviewTelemetry(undefined)).toBeUndefined()
  })
})

describe("LegionSessionProcessor.markReviewTelemetry", () => {
  for (const command of REVIEW_COMMANDS) {
    test(`stamps text parts with telemetry for ${command}`, () => {
      const parts: Array<{ type: string; metadata?: Record<string, unknown> }> = [
        { type: "text", metadata: { existing: "keep" } },
        { type: "file" },
        { type: "text" },
      ]
      const tel = LegionSessionProcessor.markReviewTelemetry(parts, command)
      expect(tel).toEqual(expected(command))
      expect(parts[0].metadata).toEqual({ existing: "keep", ...expected(command) })
      expect(parts[1].metadata).toBeUndefined()
      expect(parts[2].metadata).toEqual({ ...expected(command) })
    })
  }

  test("does nothing for an unrelated command", () => {
    const parts: Array<{ type: string; metadata?: Record<string, unknown> }> = [{ type: "text" }]
    expect(LegionSessionProcessor.markReviewTelemetry(parts, "init")).toBeUndefined()
    expect(parts[0].metadata).toBeUndefined()
  })

  test("does nothing for an undefined command", () => {
    const parts: Array<{ type: string; metadata?: Record<string, unknown> }> = [{ type: "text" }]
    expect(LegionSessionProcessor.markReviewTelemetry(parts, undefined)).toBeUndefined()
    expect(parts[0].metadata).toBeUndefined()
  })
})

describe("LegionSessionProcessor.extractReviewTelemetry", () => {
  for (const command of REVIEW_COMMANDS) {
    test(`recovers ${command} telemetry from marked text parts`, () => {
      const parts: Array<{ type: string; metadata?: Record<string, unknown> }> = [{ type: "text" }]
      LegionSessionProcessor.markReviewTelemetry(parts, command)
      const round = LegionSessionProcessor.extractReviewTelemetry(parts as unknown as MessageV2.Part[])
      expect(round).toEqual(expected(command))
    })
  }

  test("returns undefined when parts have no review metadata", () => {
    const parts: Array<{ type: string; metadata?: Record<string, unknown> }> = [
      { type: "text" },
      { type: "text", metadata: { foo: "bar" } },
    ]
    expect(LegionSessionProcessor.extractReviewTelemetry(parts as unknown as MessageV2.Part[])).toBeUndefined()
  })

  test("returns undefined when command in metadata is unknown", () => {
    const parts: Array<{ type: string; metadata?: Record<string, unknown> }> = [
      { type: "text", metadata: { mode: "review", feature: "code_reviews", command: "unknown" } },
    ]
    expect(LegionSessionProcessor.extractReviewTelemetry(parts as unknown as MessageV2.Part[])).toBeUndefined()
  })
})

describe("LegionSessionProcessor.suggestionReviewTelemetry", () => {
  test("returns suggest-sourced telemetry for accepted review commands", () => {
    expect(
      LegionSessionProcessor.suggestionReviewTelemetry({
        accepted: { prompt: "/review uncommitted --focus telemetry" },
      }),
    ).toEqual({ ...expected("review"), tool: "suggest" })
  })

  test("returns undefined for accepted non-review commands", () => {
    expect(LegionSessionProcessor.suggestionReviewTelemetry({ accepted: { prompt: "/test" } })).toBeUndefined()
  })

  test("returns undefined when accepted prompt is not a slash command", () => {
    expect(LegionSessionProcessor.suggestionReviewTelemetry({ accepted: { prompt: "Run tests" } })).toBeUndefined()
  })

  test("returns undefined when accepted metadata is missing", () => {
    expect(LegionSessionProcessor.suggestionReviewTelemetry({ dismissed: true })).toBeUndefined()
  })
})

describe("LegionSessionProcessor.extractSuggestionReviewTelemetry", () => {
  test("recovers review telemetry from completed suggest tool metadata", () => {
    const parts = [
      {
        type: "tool",
        tool: "suggest",
        state: {
          status: "completed",
          metadata: { accepted: { prompt: "/review branch" } },
        },
      },
    ]

    expect(LegionSessionProcessor.extractSuggestionReviewTelemetry(parts as unknown as MessageV2.Part[])).toEqual({
      ...expected("review"),
      tool: "suggest",
    })
  })
})
