// kilocode_change - new file
//
// Kilo uses Npm.Service (arborist) for dependency installation and may write
// a .gitignore inside the .kilocode config dir. Users may have pnpm or yarn as
// their system package manager, which can produce lockfiles in the .kilocode/
// config directory. These must be ignored so they don't appear as untracked
// files in the user's project.

import { expect, test } from "bun:test"
import fs from "fs/promises"
import path from "path"
import { Effect, Layer, Option } from "effect"
import { NodeFileSystem, NodePath } from "@effect/platform-node"
import { Config } from "../../src/config/config"
import { EffectFlock } from "@opencode-ai/core/util/effect-flock"
import { Npm } from "@opencode-ai/core/npm"
import { AppFileSystem } from "@opencode-ai/core/filesystem"
import { Env } from "../../src/env"
import { Git } from "../../src/git"
import { Auth } from "../../src/auth"
import { Account } from "../../src/account/account"
import { provideTestInstance } from "../fixture/fixture"
import { Filesystem } from "../../src/util/filesystem"
import * as CrossSpawnSpawner from "@opencode-ai/core/cross-spawn-spawner"
import { HttpClient } from "effect/unstable/http"
import { tmpdir } from "../fixture/fixture"
import { InstanceRef } from "../../src/effect/instance-ref"

const infra = CrossSpawnSpawner.defaultLayer.pipe(
  Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
)

const emptyAccount = Layer.mock(Account.Service)({
  active: () => Effect.succeed(Option.none()),
  activeOrg: () => Effect.succeed(Option.none()),
})

const emptyAuth = Layer.mock(Auth.Service)({
  all: () => Effect.succeed({}),
})

const noopNpm = Layer.mock(Npm.Service)({
  install: () => Effect.void,
  add: () => Effect.die("not implemented"),
  which: () => Effect.succeed(Option.none()),
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

test(".gitignore in .kilocode config dir includes pnpm and yarn lockfile patterns", async () => {
  await using tmp = await tmpdir()
  const dir = path.join(tmp.path, "a")
  const kilo = path.join(dir, ".kilocode")
  await fs.mkdir(kilo, { recursive: true })

  await provideTestInstance({
    directory: dir,
    fn: async (ctx) => {
      await Effect.runPromise(Config.Service.use((svc) => svc.get()).pipe(
        Effect.scoped,
        Effect.provide(testLayer),
        Effect.provideService(InstanceRef, ctx),
      ))
    },
  })

  const ignore = await Filesystem.readText(path.join(kilo, ".gitignore"))
  expect(ignore).toContain("pnpm-lock.yaml")
  expect(ignore).toContain("yarn.lock")
})
