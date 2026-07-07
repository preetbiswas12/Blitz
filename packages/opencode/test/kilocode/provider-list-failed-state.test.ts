// kilocode_change - new file
// Verifies that:
//   1. ModelCache.failedProviders() surfaces providers that encountered errors.
//   2. ModelCache.getFailure() returns the typed error for a failed provider.
//   3. Clear removes failure state.

import { beforeEach, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import type { ModelsDev } from "@opencode-ai/core/models-dev"
import * as Log from "@opencode-ai/core/util/log"

Log.init({ print: false })

import { Auth } from "../../src/auth"
import { ModelCache } from "../../src/provider/model-cache"
import { TestConfig } from "../fixture/config"
import { testEffect } from "../lib/effect"

type Result = { models: ModelsDev.Provider["models"]; error?: string }

let result: Result = { models: {} }
let error: Error | undefined

const auth = Layer.mock(Auth.Service)({
  get: () => Effect.succeed(undefined),
})

function layer() {
  const models = Layer.succeed(
    ModelCache.BlitxModelsService,
    ModelCache.BlitxModelsService.of({
      fetch: () => (error ? Effect.fail(error) : Effect.succeed(result)),
    }),
  )
  return Layer.fresh(ModelCache.layer).pipe(
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(TestConfig.layer()),
    Layer.provide(auth),
    Layer.provide(models),
  )
}

const it = testEffect(Layer.empty)

beforeEach(() => {
  result = { models: {} }
  error = undefined
})

it.live("failedProviders returns empty array when no fetch has occurred", () =>
  ModelCache.Service.use((cache) =>
    Effect.gen(function* () {
      expect(yield* cache.failedProviders()).not.toContain("blitx")
    }),
  ).pipe(Effect.provide(layer())),
)

it.live("getFailure returns undefined when fetch succeeds", () =>
  Effect.gen(function* () {
    result = {
      models: {
        "test/model": {
          id: "test/model",
          name: "Test",
          attachment: false,
          reasoning: false,
          release_date: "",
          temperature: true,
          tool_call: true,
          cost: { input: 1, output: 2 },
          limit: { context: 128000, output: 4096 },
        },
      },
    }
    yield* ModelCache.Service.use((cache) =>
      Effect.gen(function* () {
        yield* cache.fetch("blitx")
        expect(yield* cache.getFailure("blitx")).toBeUndefined()
        expect(yield* cache.failedProviders()).not.toContain("blitx")
      }),
    ).pipe(Effect.provide(layer()))
  }),
)

it.live("failedProviders includes provider after auth error", () =>
  Effect.gen(function* () {
    result = { models: {}, error: "unauthorized" }
    yield* ModelCache.Service.use((cache) =>
      Effect.gen(function* () {
        yield* cache.fetch("blitx")
        expect(yield* cache.failedProviders()).toContain("blitx")
        expect(yield* cache.getFailure("blitx")).toBe("unauthorized")
      }),
    ).pipe(Effect.provide(layer()))
  }),
)

it.live("gateway rejection remains recoverable through the Effect error channel", () =>
  Effect.gen(function* () {
    error = new Error("gateway failed")
    yield* ModelCache.Service.use((cache) =>
      Effect.gen(function* () {
        const models = yield* cache.fetch("blitx").pipe(Effect.catch(() => Effect.succeed({})))
        expect(models).toEqual({})
      }),
    ).pipe(Effect.provide(layer()))
  }),
)

it.live("clear removes failure state", () =>
  Effect.gen(function* () {
    result = { models: {}, error: "network" }
    yield* ModelCache.Service.use((cache) =>
      Effect.gen(function* () {
        yield* cache.fetch("blitx")
        expect(yield* cache.failedProviders()).toContain("blitx")
        yield* cache.clear("blitx")
        expect(yield* cache.failedProviders()).not.toContain("blitx")
        expect(yield* cache.getFailure("blitx")).toBeUndefined()
      }),
    ).pipe(Effect.provide(layer()))
  }),
)

it.live("failure state is cleared when subsequent refresh succeeds", () =>
  Effect.gen(function* () {
    result = { models: {}, error: "unauthorized" }
    yield* ModelCache.Service.use((cache) =>
      Effect.gen(function* () {
        yield* cache.fetch("blitx")
        expect(yield* cache.failedProviders()).toContain("blitx")
        result = {
          models: {
            "test/model": {
              id: "test/model",
              name: "Test",
              attachment: false,
              reasoning: false,
              release_date: "",
              temperature: true,
              tool_call: true,
              cost: { input: 1, output: 2 },
              limit: { context: 128000, output: 4096 },
            },
          },
        }
        yield* cache.refresh("blitx")
        expect(yield* cache.failedProviders()).not.toContain("blitx")
        expect(yield* cache.getFailure("blitx")).toBeUndefined()
      }),
    ).pipe(Effect.provide(layer()))
  }),
)
