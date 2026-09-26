import { describe, expect } from "bun:test"
import { Duration, Effect, Layer, Option } from "effect"
import { AppFileSystem } from "@opencode-ai/core/filesystem"
import { CrossSpawnSpawner } from "@opencode-ai/core/cross-spawn-spawner"
import { Account } from "@/account/account"
import { AccessToken, AccountID, DeviceCode, Login, OrgID, PollSuccess, UserCode } from "@/account/schema"
import { Bus } from "@/bus"
import { Auth } from "@/auth"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { Plugin } from "@/plugin"
import { ModelCache } from "@/provider/model-cache"
import { ProviderAuth } from "@/provider/auth"
import { ProviderID } from "@/provider/schema"
import { TestConfig } from "../../fixture/config"
import { TestInstance, provideInstance } from "../../fixture/fixture"
import { testEffect } from "../../lib/effect"

const it = testEffect(Layer.mergeAll(CrossSpawnSpawner.defaultLayer, AppFileSystem.defaultLayer))

const info = new Account.Info({
  id: AccountID.make("account-1"),
  email: "user@example.com",
  url: "https://console.opencode.ai",
  active_org_id: OrgID.make("org-1"),
})

const login = new Login({
  code: DeviceCode.make("device-1"),
  user: UserCode.make("ABCD-EFGH"),
  url: "https://console.opencode.ai/device?user_code=ABCD-EFGH",
  server: "https://console.opencode.ai",
  expiry: Duration.seconds(10),
  interval: Duration.zero,
})

const account = Layer.mock(Account.Service, {
  login: () => Effect.succeed(login),
  poll: () => Effect.succeed(new PollSuccess({ email: info.email })),
  active: () => Effect.succeed(Option.some(info)),
  token: () => Effect.succeed(Option.some(AccessToken.make("access-token"))),
})

function layer(directory: string) {
  return ProviderAuth.layer.pipe(
    Layer.provide(Auth.defaultLayer),
    Layer.provide(ModelCache.defaultLayer),
    Layer.provide(account),
    Layer.provide(
      Plugin.layer.pipe(
        Layer.provide(Bus.layer),
        Layer.provide(RuntimeFlags.layer()),
        Layer.provide(
          TestConfig.layer({
            get: () => Effect.succeed({ plugin: [], plugin_origins: [] }),
            directories: () => Effect.succeed([directory]),
          }),
        ),
      ),
    ),
  )
}

describe("opencode provider auth", () => {
  it.instance(
    "exposes account device login through the provider auth API",
    () =>
      Effect.gen(function* () {
        const tmp = yield* TestInstance
        const result = yield* Effect.gen(function* () {
          const service = yield* ProviderAuth.Service
          const methods = yield* service.methods()
          const method = methods[ProviderID.make("opencode")]
          expect(method).toHaveLength(1)
          expect(method?.[0]).toMatchObject({ type: "oauth", label: "Login with OpenCode" })

          const providerID = ProviderID.make("opencode")
          const authorization = yield* service.authorize({ providerID, method: 0 })
          expect(authorization).toMatchObject({ method: "auto", url: login.url })

          yield* service.callback({ providerID, method: 0 })
        }).pipe(Effect.provide(layer(tmp.directory)), provideInstance(tmp.directory))
        return result
      }),
    { git: true },
    30000,
  )
})
