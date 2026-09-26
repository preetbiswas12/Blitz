import { describe, expect } from "bun:test"
import { Duration, Effect, Layer, Option } from "effect"
import { Account } from "@/account/account"
import { AccessToken, AccountID, DeviceCode, Login, OrgID, PollPending, PollSuccess, UserCode } from "@/account/schema"
import { opencodeAuth } from "@/kilocode/provider/opencode-auth"
import { testEffect } from "../../lib/effect"

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

const polls = { count: 0 }

const it = testEffect(
  Layer.mock(Account.Service, {
    login: () => Effect.succeed(login),
    poll: () => {
      polls.count += 1
      return Effect.succeed(polls.count === 1 ? new PollPending() : new PollSuccess({ email: info.email }))
    },
    active: () => Effect.succeed(Option.some(info)),
    token: () => Effect.succeed(Option.some(AccessToken.make("access-token"))),
  }),
)

describe("opencode account auth", () => {
  it.effect("completes device login and returns the account access token", () =>
    Effect.gen(function* () {
      const account = yield* Account.Service
      const hook = opencodeAuth(account)
      const method = hook.methods[0]
      expect(method.type).toBe("oauth")
      if (method.type !== "oauth") return

      const authorization = yield* Effect.promise(() => method.authorize())
      expect(authorization).toMatchObject({
        url: login.url,
        instructions: `Enter code: ${login.user}`,
        method: "auto",
      })
      if (authorization.method !== "auto") return

      const result = yield* Effect.promise(() => authorization.callback())
      expect(result).toEqual({
        type: "success",
        key: "access-token",
        metadata: { source: "opencode-account" },
      })
      expect(polls.count).toBe(2)
    }),
  )
})
