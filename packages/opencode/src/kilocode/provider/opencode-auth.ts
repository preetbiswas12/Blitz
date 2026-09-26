import { Account } from "@/account/account"
import type { Hooks } from "@legion/plugin"
import { Duration, Effect, Option } from "effect"

const server = "https://console.opencode.ai"

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
              if (result._tag !== "PollSuccess") return { type: "failed" as const }

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
    ],
  }
}
