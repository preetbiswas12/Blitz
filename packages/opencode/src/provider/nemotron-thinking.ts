import type { Provider } from "@/provider/provider"

/**
 * NVIDIA Nemotron thinking output handler
 * Prevents 504 timeouts by forcing continuous thinking token generation
 * similar to DeepSeek's reasoning blocks, keeping the connection alive.
 */

export namespace NemotronThinking {
  /**
   * Check if model is NVIDIA Nemotron
   */
  export function isNemotron(model: Provider.Model): boolean {
    return (
      model.providerID === "nvidia" ||
      model.family === "nemotron" ||
      model.id.toLowerCase().includes("nemotron")
    )
  }

  /**
   * Inject thinking output instruction into system prompt
   * Forces Nemotron to generate <think> blocks continuously during reasoning
   */
  export function injectThinkingPrompt(systemPrompts: string[]): string[] {
    return [
      ...systemPrompts,
      `## Thinking Output Protocol

You MUST output your reasoning process inside <think>...</think> tags. This keeps the connection alive during processing.

Format your response as:
<think>
Step 1: [analyze the problem]
Step 2: [consider approaches]
Step 3: [implement solution]
...
</think>

Then provide the final response after the closing </think> tag.

CRITICAL: Stream thinking blocks continuously. Do not stay silent. Output reasoning tokens as you generate them.`,
    ]
  }

  /**
   * Enable thinking output in model options
   * Adds parameters to request thinking token generation
   */
  export function injectThinkingOptions(options: Record<string, any>): Record<string, any> {
    return {
      ...options,
      // Enable continuous token streaming for thinking
      temperature: Math.min(options.temperature ?? 0.7, 0.9), // Slightly increase for reasoning diversity
      // Nemotron responds to system instruction above; no special API param needed
    }
  }

  /**
   * Regex to extract thinking blocks from response.
   */
  const THINKING_BLOCK_REGEX = /<think>([\s\S]*?)<\/think>/g // kilocode_change - match </think>

  /**
   * Extract thinking tokens from streaming response
   * Returns { thinking, code } where thinking is extracted reasoning
   */
  export function extractThinkingBlock(text: string): { thinking: string; code: string } {
    const thinking: string[] = []
    let code = text

    const matches = Array.from(text.matchAll(THINKING_BLOCK_REGEX))

    if (matches.length > 0) {
      // Build thinking from all blocks
      for (const match of matches) {
        thinking.push(match[1].trim())
      }
      // Remove thinking blocks from code output
      code = text.replace(THINKING_BLOCK_REGEX, "").trim()
    }

    return {
      thinking: thinking.join("\n\n"),
      code,
    }
  }

  /**
   * Format thinking output for UI display (collapsed by default)
   */
  export function formatThinkingUI(thinking: string): string {
    if (!thinking) return ""
    const lines = thinking.split("\n").length
    return `[💭 Thinking (${lines} lines) - click to expand]`
  }
}
