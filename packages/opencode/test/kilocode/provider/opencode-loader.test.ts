import { describe, expect } from "bun:test"
import { InstallationChannel, InstallationVersion } from "@opencode-ai/core/installation/version"
import { Effect, Layer, Option } from "effect"
import { Account } from "@/account/account"
import { AccessToken, AccountID, OrgID } from "@/account/schema"
import { LegionCustomLoaders } from "@/kilocode/provider/provider"
import { testEffect } from "../../lib/effect"

const it = testEffect(Layer.empty)

const info = new Account.Info({
  id: AccountID.make("account-1"),
  email: "user@example.com",
  url: "https://console.opencode.ai",
  active_org_id: OrgID.make("org-1"),
})

const account = Layer.mock(Account.Service, {
  active: () => Effect.succeed(Option.some(info)),
  token: () => Effect.succeed(Option.some(AccessToken.make("account-token"))),
})

const input = () => ({
  id: "opencode",
  env: ["OPENCODE_API_KEY"],
  models: {
    free: { cost: { input: 0 } },
    paid: { cost: { input: 1 } },
  },
})

const dep = (input: {
  env?: Record<string, string>
  auth?: { type: string; key: string; metadata?: Record<string, unknown> } | undefined
  key?: string
}) => ({
  env: () => Effect.succeed(input.env ?? {}),
  auth: () => Effect.succeed(input.auth),
  config: () => Effect.succeed(input.key ? { provider: { opencode: { options: { apiKey: input.key } } } } : {}),
  get: () => Effect.succeed(undefined),
})

const ua = `opencode/${InstallationChannel}/${InstallationVersion}/cli`

describe("opencode provider loader", () => {
  it.effect("uses the account token and keeps every model", () =>
    Effect.gen(function* () {
      const model = input()
      const result = yield* LegionCustomLoaders(dep({})).opencode(model).pipe(Effect.provide(account))
      expect(result.options?.apiKey).toBe("account-token")
      expect(Object.keys(model.models)).toEqual(["free", "paid"])
      expect(result.options?.headers).toMatchObject({ "User-Agent": ua })
      expect(result.autoload).toBe(true)
    }),
  )

  it.effect("refreshes a stored account-managed credential from the account service", () =>
    Effect.gen(function* () {
      const result = yield* LegionCustomLoaders(
        dep({ auth: { type: "api", key: "stale", metadata: { source: "opencode-account" } } }),
      )
        .opencode(input())
        .pipe(Effect.provide(account))
      expect(result.options?.apiKey).toBe("account-token")
    }),
  )

  it.effect("prefers an explicit env or config credential over the account token", () =>
    Effect.gen(function* () {
      const fromEnv = yield* LegionCustomLoaders(dep({ env: { OPENCODE_API_KEY: "env-key" } }))
        .opencode(input())
        .pipe(Effect.provide(account))
      expect(fromEnv.options?.apiKey).toBeUndefined()

      const fromConfig = yield* LegionCustomLoaders(dep({ key: "config-key" }))
        .opencode(input())
        .pipe(Effect.provide(account))
      expect(fromConfig.options?.apiKey).toBeUndefined()
    }),
  )

  it.effect("falls back to the public key and hides paid models without credentials", () =>
    Effect.gen(function* () {
      const model = input()
      const result = yield* LegionCustomLoaders(dep({})).opencode(model)
      expect(result.options?.apiKey).toBe("public")
      expect(Object.keys(model.models)).toEqual(["free"])
    }),
  )
})
