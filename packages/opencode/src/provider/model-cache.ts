// kilocode_change - new file
import { KiloGateway } from "@legion/kilocode" // kilocode_change
import { Context, Duration, Effect, Layer, Schema } from "effect"
import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "effect/unstable/http"
import { Config } from "../config/config"
import { Auth } from "../auth"
import type { Provider } from "@opencode-ai/core/models-dev"
import * as Log from "@opencode-ai/core/util/log"

type LegionModelsResult = { readonly models: Record<string, unknown>; readonly error?: string }

export interface KiloModels {
  readonly fetch: (options: {
    token?: string
    organizationId?: string
    baseURL?: string
  }) => Effect.Effect<LegionModelsResult, unknown>
}

export class LegionModelsService extends Context.Service<LegionModelsService, KiloModels>()(
  "@legion/ModelCache/KiloModels",
) {}

export const LegionModelsLayer = Layer.succeed(
  LegionModelsService,
  LegionModelsService.of({
    fetch: (options) =>
      Effect.tryPromise({
        try: () => KiloGateway.fetchModels(options), // kilocode_change
        catch: () => "network-error",
      }).pipe(Effect.map((result: { models: Record<string, unknown>; error?: string }) => ({ models: result.models, error: result.error }))),
  }),
)
type Models = Provider["models"]
type KiloOptions = {
  readonly token?: string
  readonly organizationId?: string
  readonly baseURL?: string
}
type Options = { -readonly [K in keyof KiloOptions]?: KiloOptions[K] } & {
  apiKey?: string
  kilocodeOrganizationId?: string
  kilocodeToken?: string
}
type Failure = NonNullable<LegionModelsResult["error"]>
type Result = { readonly models: Models; readonly error?: Failure }
type View = { models?: Models; timestamp?: number }
type Cell = {
  readonly providerID: string
  readonly view: View
  readonly cached: Effect.Effect<Result, unknown>
  readonly invalidate: Effect.Effect<void>
}

export interface Interface {
  readonly getFailure: (providerID: string) => Effect.Effect<Failure | undefined>
  readonly failedProviders: () => Effect.Effect<string[]>
  readonly get: (providerID: string) => Effect.Effect<Models | undefined>
  readonly fetch: (providerID: string, options?: Options) => Effect.Effect<Models, unknown>
  readonly refresh: (providerID: string, options?: Options) => Effect.Effect<Models, unknown>
  readonly clear: (providerID: string) => Effect.Effect<void>
}

export class Service extends Context.Service<Service, Interface>()("@legion/ModelCache") {}

const log = Log.create({ service: "model-cache" })
const ttl = Duration.minutes(5)
const APERTIS_BASE_URL = "https://api.apertis.ai/v1"
const ApertisItem = Schema.Struct({ id: Schema.String, owned_by: Schema.optional(Schema.String) })
const ApertisResponse = Schema.Struct({ data: Schema.optional(Schema.Array(ApertisItem)) })
type ApertisItem = Schema.Schema.Type<typeof ApertisItem>
const OpenAIModelsResponse = Schema.Struct({
  data: Schema.optional(
    Schema.Array(
      Schema.Struct({
        id: Schema.String,
        name: Schema.optional(Schema.String),
        owned_by: Schema.optional(Schema.String),
      }),
    ),
  ),
})

export const layer: Layer.Layer<
  Service,
  never,
  Auth.Service | Config.Service | LegionModelsService | HttpClient.HttpClient
> = Layer.effect(
  Service,
  Effect.gen(function* () {
    const auth = yield* Auth.Service
    const cfg = yield* Config.Service
    const kilo = yield* LegionModelsService
    const http = yield* HttpClient.HttpClient
    const cells = new Map<string, Cell>()
    const active = new Map<string, Cell>()
    const versions = new Map<string, number>()
    const failures = new Map<string, Failure>()

    const getFailure = Effect.fn("ModelCache.getFailure")(function* (providerID: string) {
      return failures.get(providerID)
    })

    const failedProviders = Effect.fn("ModelCache.failedProviders")(function* () {
      return [...failures.keys()]
    })

    const aperture = (item: ApertisItem): Models[string] => ({
      id: item.id,
      name: item.id,
      family: item.owned_by ?? "",
      release_date: "",
      attachment: true,
      reasoning: false,
      temperature: true,
      tool_call: true,
      cost: { input: 0, output: 0 },
      limit: { context: 128000, output: 4096 },
      modalities: { input: ["text", "image"], output: ["text"] },
    })

    const fetchApertisModels = Effect.fn("ModelCache.fetchApertisModels")(function* (options: Options) {
      const baseURL = options.baseURL ?? APERTIS_BASE_URL
      if (!options.apiKey) {
        log.debug("no API key for apertis, skipping model fetch")
        return {}
      }

      const url = `${String(baseURL ?? "").replace(/\/+$/, "")}/models`
      const response = yield* HttpClientRequest.get(url).pipe(
        HttpClientRequest.acceptJson,
        HttpClientRequest.bearerToken(options.apiKey),
        http.execute,
        Effect.timeout("10 seconds"),
      )
      if (response.status < 200 || response.status >= 300) {
        log.error("apertis model fetch failed", { status: response.status })
        return {}
      }

      const json = yield* HttpClientResponse.schemaBodyJson(ApertisResponse)(response)
      return Object.fromEntries((json.data ?? []).map((item) => [item.id, aperture(item)]))
    })

    const fetchOpenAICompatibleModels = Effect.fn("ModelCache.fetchOpenAICompatibleModels")(
      function* (options: Options) {
        const baseURL = options.baseURL
        if (!baseURL || !options.apiKey) {
          log.debug("no baseURL or apiKey for openai-compatible provider, skipping model fetch")
          return {}
        }

        const url = `${String(baseURL).replace(/\/+$/, "")}/models`
        const response = yield* HttpClientRequest.get(url).pipe(
          HttpClientRequest.acceptJson,
          HttpClientRequest.bearerToken(options.apiKey),
          http.execute,
          Effect.timeout("10 seconds"),
        )
        if (response.status < 200 || response.status >= 300) {
          log.error("openai-compatible model fetch failed", { status: response.status, url })
          return {}
        }

        const json = yield* HttpClientResponse.schemaBodyJson(OpenAIModelsResponse)(response)
        const models: Models = {}
        const items = json.data ?? []
        for (const item of items) {
          if (!item?.id) continue
          models[item.id] = {
            id: item.id,
            name: item.name ?? item.id,
            family: item.owned_by ?? "",
            release_date: "",
            attachment: true,
            reasoning: false,
            temperature: true,
            tool_call: true,
            cost: { input: 0, output: 0 },
            limit: { context: 128000, output: 4096 },
            modalities: { input: ["text"], output: ["text"] },
          }
        }
        return models
      },
    )

    const authOptions = Effect.fn("ModelCache.authOptions")(function* (providerID: string) {
      if (
        providerID !== "legion" &&
        providerID !== "kilocode" &&
        providerID !== "apertis"
      ) {
        const isKnownProvider =
          providerID === "opencode" ||
          providerID === "anthropic" ||
          providerID === "openai" ||
          providerID === "google" ||
          providerID === "google-vertex" ||
          providerID === "github-copilot" ||
          providerID === "amazon-bedrock" ||
          providerID === "azure" ||
          providerID === "openrouter" ||
          providerID === "mistral" ||
          providerID === "gitlab"
        if (!isKnownProvider) {
          const config = yield* cfg.get()
          const customProvider = config.provider?.[providerID]
          if (customProvider?.openaiCompatible) {
            const options: Options = {}
            if (customProvider.openaiCompatible.apiKey) options.apiKey = customProvider.openaiCompatible.apiKey
            if (customProvider.openaiCompatible.baseURL) options.baseURL = customProvider.openaiCompatible.baseURL
            if (customProvider.options?.apiKey) options.apiKey = customProvider.options.apiKey
            if (customProvider.options?.baseURL) options.baseURL = customProvider.options.baseURL
            return options
          }
        }
        return {}
      }
      const config = yield* cfg.get()
      const options: Options = {}

      if (providerID === "legion" || providerID === "kilocode") {
        const item = config.provider?.[providerID]
        if (item?.options?.apiKey) options.apiKey = item.options.apiKey
        if (item?.options?.kilocodeOrganizationId) options.kilocodeOrganizationId = item.options.kilocodeOrganizationId

        const info = yield* auth.get(providerID)
        if (info?.type === "api") options.apiKey = info.key
        if (info?.type === "oauth") {
          options.apiKey = info.access
          if (info.accountId) options.kilocodeOrganizationId = info.accountId
        }

        if (process.env.KILO_API_KEY) options.apiKey = process.env.KILO_API_KEY
        if (process.env.KILO_ORG_ID) options.kilocodeOrganizationId = process.env.KILO_ORG_ID
        log.debug("auth options resolved", {
          providerID,
          hasToken: !!options.apiKey,
          hasOrganizationId: !!options.kilocodeOrganizationId,
        })
      }

      if (providerID === "apertis") {
        const item = config.provider?.[providerID]
        if (item?.options?.apiKey) options.apiKey = item.options.apiKey
        if (item?.options?.baseURL) options.baseURL = item.options.baseURL

        const info = yield* auth.get(providerID)
        if (info?.type === "api") options.apiKey = info.key
        if (process.env.APERTIS_API_KEY) options.apiKey = process.env.APERTIS_API_KEY
        if (process.env.APERTIS_BASE_URL) options.baseURL = process.env.APERTIS_BASE_URL
        log.debug("apertis auth options resolved", {
          providerID,
          hasKey: !!options.apiKey,
          hasBaseURL: !!options.baseURL,
        })
      }

      return options
    })

    const fetchModels = Effect.fn("ModelCache.fetchModels")(function* (providerID: string, options: Options) {
      if (providerID === "legion") return yield* kilo.fetch(options)
      if (providerID === "kilocode") {
        return yield* KiloGateway.fetchModels({
          token: options.apiKey,
          organizationId: options.kilocodeOrganizationId,
          baseURL: options.baseURL,
        }).pipe(Effect.map((models) => ({ models })))
      }
      if (providerID === "apertis") return yield* fetchApertisModels(options).pipe(Effect.map((models) => ({ models })))

      const isKnownProvider =
        providerID === "opencode" ||
        providerID === "anthropic" ||
        providerID === "openai" ||
        providerID === "google" ||
        providerID === "google-vertex" ||
        providerID === "github-copilot" ||
        providerID === "amazon-bedrock" ||
        providerID === "azure" ||
        providerID === "openrouter" ||
        providerID === "mistral" ||
        providerID === "gitlab"
      if (!isKnownProvider) {
        const config = yield* cfg.get()
        if (config.provider?.[providerID]?.openaiCompatible) {
          return yield* fetchOpenAICompatibleModels(options).pipe(Effect.map((models) => ({ models })))
        }
      }

      log.debug("provider not implemented", { providerID })
      return { models: {} }
    })

    const load = Effect.fn("ModelCache.load")(function* (providerID: string, options: Options) {
      const resolved = yield* authOptions(providerID).pipe(
        Effect.catchCause((cause) =>
          Effect.sync(() => {
            log.warn("auth options failed", { providerID, cause })
            return {}
          }),
        ),
      )
      return yield* fetchModels(providerID, { ...resolved, ...options })
    })

    const key = Effect.fn("ModelCache.key")(function* (providerID: string, options?: Options) {
      if (providerID === "legion" || providerID === "kilocode") {
        return JSON.stringify([providerID, options?.baseURL, options?.kilocodeOrganizationId, options?.apiKey])
      }
      if (providerID === "apertis") return JSON.stringify([providerID, options?.baseURL, options?.apiKey])

      const isKnownProvider =
        providerID === "opencode" ||
        providerID === "anthropic" ||
        providerID === "openai" ||
        providerID === "google" ||
        providerID === "google-vertex" ||
        providerID === "github-copilot" ||
        providerID === "amazon-bedrock" ||
        providerID === "azure" ||
        providerID === "openrouter" ||
        providerID === "mistral" ||
        providerID === "gitlab"
      if (!isKnownProvider) {
        const config = yield* cfg.get()
        if (config.provider?.[providerID]?.openaiCompatible) {
          return JSON.stringify([providerID, options?.baseURL, options?.apiKey])
        }
      }

      return providerID
    })

    const cell = Effect.fn("ModelCache.cell")(function* (providerID: string, options: Options = {}) {
      const id = yield* key(providerID, options)
      const existing = cells.get(id)
      if (existing) return existing
      const view: View = {}
      const [cached, invalidate] = yield* Effect.cachedInvalidateWithTTL(load(providerID, options), ttl)
      const next = { providerID, view, cached, invalidate }
      cells.set(id, next)
      return next
    })

    // Failed loads are not cached so a temporary outage can recover on the next read.
    const evaluate = (entry: Cell) => entry.cached.pipe(Effect.tapCause(() => entry.invalidate))

    const commit = (providerID: string, version: number, entry: Cell, result: Result) =>
      Effect.sync(() => {
        if ((versions.get(providerID) ?? 0) !== version) return result.models
        if (result.error) {
          failures.set(providerID, result.error)
          log.warn("model fetch error", { providerID, error: result.error })
        } else {
          failures.delete(providerID)
        }
        entry.view.models = result.models
        entry.view.timestamp = Date.now()
        active.set(providerID, entry)
        log.info("models fetched and cached", { providerID, count: Object.keys(result.models).length })
        return result.models
      })

    const get = Effect.fn("ModelCache.get")(function* (providerID: string) {
      const entry = active.get(providerID)
      if (!entry?.view.models || entry.view.timestamp === undefined) {
        log.debug("cache miss", { providerID })
        return
      }

      const age = Date.now() - entry.view.timestamp
      if (age > Duration.toMillis(ttl)) {
        log.debug("cache expired", { providerID, age })
        entry.view.models = undefined
        entry.view.timestamp = undefined
        yield* entry.invalidate
        return
      }

      log.debug("cache hit", { providerID, age })
      return entry.view.models
    })

    const fetch = Effect.fn("ModelCache.fetch")(function* (providerID: string, options?: Options) {
      const cached = yield* get(providerID)
      if (cached) return cached
      const version = (versions.get(providerID) ?? 0) + 1
      versions.set(providerID, version)
      const entry = yield* cell(providerID, options)
      log.info("fetching models", { providerID })
      const result = yield* evaluate(entry)
      return yield* commit(providerID, version, entry, result)
    })

    const refresh = Effect.fn("ModelCache.refresh")(function* (providerID: string, options?: Options) {
      const version = (versions.get(providerID) ?? 0) + 1
      versions.set(providerID, version)
      const entry = yield* cell(providerID, options)
      log.info("refreshing models", { providerID })
      yield* entry.invalidate
      const result = yield* evaluate(entry)
      return yield* commit(providerID, version, entry, result)
    })

    const clear = Effect.fn("ModelCache.clear")(function* (providerID: string) {
      versions.set(providerID, (versions.get(providerID) ?? 0) + 1)
      const entries = [...cells.entries()].filter(([, entry]) => entry.providerID === providerID)
      yield* Effect.all(
        entries.map(([id, entry]) => entry.invalidate.pipe(Effect.tap(() => Effect.sync(() => cells.delete(id))))),
        { discard: true },
      )
      active.delete(providerID)
      failures.delete(providerID)
      if (entries.some(([, entry]) => entry.view.models)) {
        log.info("cache cleared", { providerID })
        return
      }
      log.debug("no cache to clear", { providerID })
    })

    return Service.of({ getFailure, failedProviders, get, fetch, refresh, clear })
  }),
)

export const defaultLayer = layer.pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(Auth.defaultLayer),
  Layer.provide(Config.defaultLayer),
  Layer.provide(LegionModelsLayer),
)

export * as ModelCache from "./model-cache"
