/**
 * OpenCode Zen provider auth, surfaced in the `/connect` dialog.
 *
 * `ProviderAuth.layer` registers this as a synthetic plugin auth hook for the
 * `opencode` provider, so the shared dialog renders it with no extra wiring.
 * Two methods are offered:
 *
 *   1. "Login with OpenCode" — v2 device-code login (`oauth`).
 *   2. "API key" — the classic pasted-key flow (`api`).
 *
 * The OAuth method mirrors `legion console login` (`src/cli/cmd/account.ts`):
 * request a device code, hand the browser URL to the shared `AutoMethod` dialog
 * (KiloProvider.openAuthorization opens it in the browser), then poll until the
 * user approves. On success we return the v2 account access token, which
 * `ProviderAuth.callback` stores as the provider credential.
 *
 * The stored credential is only a "connected" marker for the `/connect` dialog:
 * `metadata.source` tells the OpenCode provider loader to use the live token
 * from the account service instead, because `Account` refreshes it over time.
 */
import { Account } from "@/account/account"
import type { Hooks } from "@legion/plugin"
import { Duration, Effect, Option } from "effect"

const server = "https://console.opencode.ai"

/**
 * Device-code poll loop. Backs off by 5s whenever the server asks us to slow
 * down; the caller bounds the whole loop with the login expiry.
 */
function poll(
  account: Account.Interface,
  login: Account.Login,
  wait: Duration.Duration,
): Effect.Effect<Account.PollResult, Account.AccountError> {
  return Effect.gen(function* () {
    yield* Effect.sleep(wait)
    const result = yield* account.poll(login)
    if (result._tag === "PollPending") return yield* poll(account, login, wait)
    if (result._tag === "PollSlow") return yield* poll(account, login, Duration.sum(wait, Duration.seconds(5)))
    return result
  })
}

export function opencodeAuth(account: Account.Interface): NonNullable<Hooks["auth"]> {
  return {
    provider: "opencode",
    methods: [
      {
        type: "oauth",
        label: "Login with OpenCode",
        authorize: async () => {
          const login = await Effect.runPromise(account.login(server))
          return {
            url: login.url,
            instructions: `Enter code: ${login.user}`,
            method: "auto" as const,
            callback: async () => {
              const result = await Effect.runPromise(
                poll(account, login, login.interval).pipe(
                  Effect.timeout(login.expiry),
                  Effect.catchTag("TimeoutError", () => Effect.succeed(new Account.PollExpired())),
                  Effect.catchCause((cause) => Effect.succeed(new Account.PollError({ cause }))),
                ),
              )
              // Expired, denied, or a transport failure: the dialog asks the user to retry.
              if (result._tag !== "PollSuccess") return { type: "failed" as const }

              // A successful poll persisted the account and made it active.
              const active = await Effect.runPromise(account.active())
              if (Option.isNone(active)) return { type: "failed" as const }
              const token = await Effect.runPromise(account.token(active.value.id))
              if (Option.isNone(token)) return { type: "failed" as const }

              return {
                type: "success" as const,
                key: String(token.value),
                metadata: { source: "opencode-account" },
              }
            },
          }
        },
      },
      { type: "api", label: "API key" },
    ],
  }
}
