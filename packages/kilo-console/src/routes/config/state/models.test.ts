import { describe, expect, test } from "bun:test"
import { hasGateway, visible } from "./privacy"

describe("model privacy filter", () => {
  test("detects when Legion Gateway models are present", () => {
    expect(hasGateway([{ id: "legion" }, { id: "openai" }])).toBe(true)
    expect(hasGateway([{ id: "openai" }])).toBe(false)
  })

  test("shows every model when disabled", () => {
    expect(visible({ id: "legion" }, { mayTrainOnYourPrompts: true }, false)).toBe(true)
  })

  test("hides only Legion Gateway models explicitly marked for prompt training", () => {
    expect(visible({ id: "legion" }, { mayTrainOnYourPrompts: true }, true)).toBe(false)
    expect(visible({ id: "legion" }, { mayTrainOnYourPrompts: false }, true)).toBe(true)
    expect(visible({ id: "legion" }, {}, true)).toBe(true)
    expect(visible({ id: "openai" }, { mayTrainOnYourPrompts: true }, true)).toBe(true)
  })
})
