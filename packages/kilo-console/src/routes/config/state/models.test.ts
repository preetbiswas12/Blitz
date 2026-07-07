import { describe, expect, test } from "bun:test"
import { hasGateway, visible } from "./privacy"

describe("model privacy filter", () => {
  test("detects when Blitx Gateway models are present", () => {
    expect(hasGateway([{ id: "blitx" }, { id: "openai" }])).toBe(true)
    expect(hasGateway([{ id: "openai" }])).toBe(false)
  })

  test("shows every model when disabled", () => {
    expect(visible({ id: "blitx" }, { mayTrainOnYourPrompts: true }, false)).toBe(true)
  })

  test("hides only Blitx Gateway models explicitly marked for prompt training", () => {
    expect(visible({ id: "blitx" }, { mayTrainOnYourPrompts: true }, true)).toBe(false)
    expect(visible({ id: "blitx" }, { mayTrainOnYourPrompts: false }, true)).toBe(true)
    expect(visible({ id: "blitx" }, {}, true)).toBe(true)
    expect(visible({ id: "openai" }, { mayTrainOnYourPrompts: true }, true)).toBe(true)
  })
})
