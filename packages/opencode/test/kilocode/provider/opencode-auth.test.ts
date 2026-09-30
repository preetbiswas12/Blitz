import { describe, expect } from "bun:test"
import { Duration, Effect, Layer, Option } from "effect"
import { Account } from "@/account/account"
import {
  AccessToken,
  AccountID,
  DeviceCode,
  Login,
  OrgID,
  PollDenied,
  PollPending,
  PollSuccess,
  UserCode,
} from "@/account/schema"
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
  // the real shape `Account.login` builds: API host + the server's
  // `verification_uri_complete`, which already carries the `/console` prefix
  url: "https://console.opencode.ai/console/device?user_code=ABCD-EFGH",
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
      expect(authorization.url).toBe("https://opencode.ai/console/device?user_code=ABCD-EFGH")
      expect(authorization.instructions).toBe(`Enter code: ${login.user}`)
      expect(authorization.method).toBe("auto")
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

  it.effect("also offers the classic api key method", () =>
    Effect.gen(function* () {
      const hook = opencodeAuth(yield* Account.Service)
      expect(hook.methods[1]).toMatchObject({ type: "api", label: "API key" })
    }),
  )

  it.effect("sends the browser to a console page that exists", () =>
    Effect.gen(function* () {
      const method = opencodeAuth(yield* Account.Service).methods[0]
      if (method.type !== "oauth") return

      const { url } = yield* Effect.promise(() => method.authorize())
      const { pathname } = new URL(url)

      // `console.opencode.ai/<path>` 302s to `opencode.ai/console/<path>`, so a
      // URL that already carries the `/console` prefix would land on the
      // doubled `/console/console/device`, which the console answers with its
      // 404 route instead of the device verification form.
      expect(pathname).toBe("/console/device")
      expect(pathname).not.toContain("/console/console/")
    }),
  )
})

const denied = testEffect(
  Layer.mock(Account.Service, {
    login: () => Effect.succeed(login),
    poll: () => Effect.succeed(new PollDenied()),
    active: () => Effect.succeed(Option.some(info)),
    token: () => Effect.succeed(Option.some(AccessToken.make("access-token"))),
  }),
)

describe("opencode account auth failures", () => {
  denied.effect("reports a denied device login as failed so the dialog can retry", () =>
    Effect.gen(function* () {
      const method = opencodeAuth(yield* Account.Service).methods[0]
      if (method.type !== "oauth") return

      const authorization = yield* Effect.promise(() => method.authorize())
      if (authorization.method !== "auto") return

      expect(yield* Effect.promise(() => authorization.callback())).toEqual({ type: "failed" })
    }),
  )
})
