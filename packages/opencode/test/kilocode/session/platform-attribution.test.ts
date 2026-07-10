import { describe, expect, test } from "bun:test"
import path from "path"
import { Effect } from "effect"
import * as Log from "@opencode-ai/core/util/log"
import { Bus } from "@/bus"
import { Session as SessionNs } from "@/session/session"
import { SessionPrompt } from "@/session/prompt"
import { AppRuntime, type AppServices } from "../../../src/effect/app-runtime"
import { LegionSession} from "../../../src/kilocode/session"
import { provideTestInstance } from "../../fixture/fixture"
import { MessageID, type SessionID } from "../../../src/session/schema"
import { ModelID, ProviderID } from "../../../src/provider/schema"

const projectRoot = path.join(__dirname, "../../..")
void Log.init({ print: false })

function run<A, E, R extends AppServices>(effect: Effect.Effect<A, E, R>) {
  return AppRuntime.runPromise(effect)
}

function create(input?: SessionNs.CreateInput) {
  return run(SessionNs.Service.use((svc) => svc.create(input)))
}

function seed(id: SessionID) {
  return run(
    SessionNs.Service.use((svc) =>
      Effect.gen(function* () {
        const user = yield* svc.updateMessage({
          id: MessageID.ascending(),
          role: "user",
          sessionID: id,
          agent: "build",
          model: { modelID: ModelID.make("test-model"), providerID: ProviderID.make("test") },
          time: { created: Date.now() },
        })
        yield* svc.updateMessage({
          id: MessageID.ascending(),
          role: "assistant",
          parentID: user.id,
          sessionID: id,
          mode: "build",
          agent: "build",
          cost: 0,
          path: { cwd: projectRoot, root: projectRoot },
          tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
          modelID: ModelID.make("test-model"),
          providerID: ProviderID.make("test"),
          time: { created: Date.now() },
          finish: "stop",
        })
      }),
    ),
  )
}

function remove(id: SessionID) {
  return run(SessionNs.Service.use((svc) => svc.remove(id)))
}

describe("session platform attribution", () => {
  test("child sessions inherit the root platform override", async () => {
    await provideTestInstance({
      directory: projectRoot,
      fn: async () => {
        const root = await create({ platform: "agent-manager" })
        const child = await create({ parentID: root.id, title: "child" })
        const attr = LegionSessionattribution(child.id)

        expect(LegionSessiongetPlatformOverride(root.id)).toBe("agent-manager")
        expect(LegionSessiongetPlatformOverride(child.id)).toBe("agent-manager")
        expect(LegionSessionresolvePlatform(child.id)).toBe("agent-manager")
        expect(attr.rootID).toBe(root.id)
        expect(attr.feature).toBe("agent-manager")

        await remove(root.id)
      },
    })
  })

  test("child sessions expose parent and root lineage", async () => {
    await provideTestInstance({
      directory: projectRoot,
      fn: async () => {
        const root = await create({})
        const child = await create({ parentID: root.id, title: "child" })
        const leaf = await create({ parentID: child.id, title: "leaf" })

        expect(LegionSessionresolveParent(root.id)).toBeUndefined()
        expect(LegionSessionresolveParent(child.id)).toBe(root.id)
        expect(LegionSessionresolveParent(leaf.id)).toBe(child.id)
        expect(LegionSessionresolveRoot(leaf.id)).toBe(root.id)

        await remove(root.id)
      },
    })
  })

  test("turn close events include persisted parent lineage", async () => {
    await provideTestInstance({
      directory: projectRoot,
      fn: async () => {
        const root = await create({})
        const child = await create({ parentID: root.id, title: "child" })
        await seed(child.id)
        LegionSessionclearPlatformOverride(child.id)
        expect(LegionSessionresolveParent(child.id)).toBeUndefined()

        const closed = Promise.withResolvers<SessionID | undefined>()
        const unsubscribe = await run(
          Bus.Service.use((bus) =>
            bus.subscribeCallback(LegionSessionEvent.TurnClose, (event) => {
              if (event.properties.sessionID === child.id) closed.resolve(event.properties.parentID)
            }),
          ),
        )

        await run(SessionPrompt.Service.use((prompt) => prompt.loop({ sessionID: child.id })))
        expect(await closed.promise).toBe(root.id)
        unsubscribe()
        await remove(root.id)
      },
    })
  })
})
