import { describe, it, expect } from "bun:test"
import { NemotronThinking } from "@/provider/nemotron-thinking"

describe("NemotronThinking", () => {
  describe("isNemotron", () => {
    it("detects nvidia provider", () => {
      const model = { providerID: "nvidia" } as any
      expect(NemotronThinking.isNemotron(model)).toBe(true)
    })

    it("detects nemotron family", () => {
      const model = { providerID: "openrouter", family: "nemotron" } as any
      expect(NemotronThinking.isNemotron(model)).toBe(true)
    })

    it("detects nemotron in model id", () => {
      const model = {
        providerID: "openrouter",
        id: "nvidia/Llama-3.1-Nemotron-Ultra-253B-v1",
        family: "llama",
      } as any
      expect(NemotronThinking.isNemotron(model)).toBe(true)
    })

    it("returns false for non-nemotron", () => {
      const model = { providerID: "openai", id: "gpt-4" } as any
      expect(NemotronThinking.isNemotron(model)).toBe(false)
    })
  })

  describe("injectThinkingPrompt", () => {
    it("injects thinking protocol into system prompts", () => {
      const result = NemotronThinking.injectThinkingPrompt(["System 1", "System 2"])
      expect(result).toHaveLength(3)
      expect(result[0]).toBe("System 1")
      expect(result[1]).toBe("System 2")
      expect(result[2]).toContain("Thinking Output Protocol")
      expect(result[2]).toContain("<think>")
    })

    it("works with empty input", () => {
      const result = NemotronThinking.injectThinkingPrompt([])
      expect(result).toHaveLength(1)
      expect(result[0]).toContain("Thinking Output Protocol")
    })
  })

  describe("injectThinkingOptions", () => {
    it("adjusts temperature for thinking", () => {
      const input = { temperature: 0.5, topP: 0.9 }
      const result = NemotronThinking.injectThinkingOptions(input)
      expect(result.temperature).toBeLessThanOrEqual(0.9)
      expect(result.topP).toBe(0.9)
    })

    it("handles missing temperature", () => {
      const input = { topP: 0.9 }
      const result = NemotronThinking.injectThinkingOptions(input)
      expect(result.temperature).toBeLessThanOrEqual(0.9)
    })

    it("caps high temperature at 0.9", () => {
      const input = { temperature: 1.5 }
      const result = NemotronThinking.injectThinkingOptions(input)
      expect(result.temperature).toBe(0.9)
    })
  })

  describe("extractThinkingBlock", () => {
    it("extracts thinking from single block", () => {
      const text =
        'Before<think>Step 1: analyze\nStep 2: solve</think>After code here'
      const { thinking, code } = NemotronThinking.extractThinkingBlock(text)
      expect(thinking).toContain("Step 1: analyze")
      expect(thinking).toContain("Step 2: solve")
      expect(code).toBe("BeforeAfter code here")
    })

    it("extracts multiple thinking blocks", () => {
      const text =
        'Text<think>Reasoning 1</think>Middle<think>Reasoning 2</think>End'
      const { thinking, code } = NemotronThinking.extractThinkingBlock(text)
      expect(thinking).toContain("Reasoning 1")
      expect(thinking).toContain("Reasoning 2")
      expect(code).toBe("TextMiddleEnd")
    })

    it("handles text without thinking blocks", () => {
      const text = "No thinking here"
      const { thinking, code } = NemotronThinking.extractThinkingBlock(text)
      expect(thinking).toBe("")
      expect(code).toBe("No thinking here")
    })

    it("preserves whitespace in thinking blocks", () => {
      const text = "<think>\n  Indented reasoning\n</think>"
      const { thinking } = NemotronThinking.extractThinkingBlock(text)
      expect(thinking).toContain("Indented reasoning")
    })
  })

  describe("formatThinkingUI", () => {
    it("formats thinking for UI", () => {
      const result = NemotronThinking.formatThinkingUI("Line1\nLine2\nLine3")
      expect(result).toContain("💭")
      expect(result).toContain("3 lines")
    })

    it("returns empty string for empty thinking", () => {
      const result = NemotronThinking.formatThinkingUI("")
      expect(result).toBe("")
    })
  })
})
