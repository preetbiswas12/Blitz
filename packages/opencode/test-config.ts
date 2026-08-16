import { Effect, Layer } from "effect"
import { Config } from "./src/config/config"
import { AppFileSystem } from "@opencode-ai/core/filesystem"
import { Env } from "./src/env"
import { Auth } from "./src/auth"
import { Account } from "./src/account/account"
import { Npm } from "@opencode-ai/core/npm"
import { Git } from "./src/git"
import { EffectFlock } from "@opencode-ai/core/util/effect-flock"
import { HttpClient } from "effect/unstable/http"
import * as CrossSpawnSpawner from "@opencode-ai/core/cross-spawn-spawner"
import { NodeFileSystem, NodePath } from "@effect/platform-node"
import fs from "fs/promises"
import path from "path"

const infra = CrossSpawnSpawner.defaultLayer.pipe(
  Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
)

const emptyAccount = Layer.mock(Account.Service)({
  active: () => Effect.succeed(undefined),
  activeOrg: () => Effect.succeed(undefined),
})

const emptyAuth = Layer.mock(Auth.Service)({
  all: () => Effect.succeed({}),
})

const noopNpm = Layer.mock(Npm.Service)({
  install: () => Effect.void,
  add: () => Effect.die("not implemented"),
  which: () => Effect.succeed(undefined),
})

const unexpectedHttp = HttpClient.make((request) =>
  Effect.die(`unexpected http request: ${request.method} ${request.url}`),
)

const testLayer = Config.defaultLayer.pipe(
  Layer.provideMerge(Layer.mergeAll(
    Git.defaultLayer,
    EffectFlock.defaultLayer,
    AppFileSystem.defaultLayer,
    Env.defaultLayer,
    emptyAuth,
    emptyAccount,
    infra,
    noopNpm,
    Layer.succeed(HttpClient.HttpClient, unexpectedHttp),
  )),
)

async function main() {
  console.log("starting")
  const tmp = await fs.mkdtemp(path.join(process.env.TEMP || "/tmp", "test-"))
  console.log("tmpdir:", tmp)
  const filepath = path.join(tmp, "kilo.json")
  await fs.writeFile(filepath, JSON.stringify({ model: "test/model" }))
  console.log("file written:", filepath)

  console.log("running config get")
  const result = await Effect.runPromise(
    Config.Service.use((svc) => svc.get()).pipe(Effect.scoped, Effect.provide(testLayer))
  )
  console.log("config result keys:", Object.keys(result))
}

main().catch(console.error)
