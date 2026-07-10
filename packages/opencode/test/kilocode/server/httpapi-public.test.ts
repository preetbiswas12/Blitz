import { describe, expect, test } from "bun:test"
import { Result, Schema as EffectSchema } from "effect"
import { OpenApi } from "effect/unstable/httpapi"
import { AgentBuilderPaths } from "../../../src/kilocode/server/httpapi/groups/agent-builder"
import { BackgroundProcessPaths } from "../../../src/kilocode/server/httpapi/groups/background-process"
import { ConfigConsolePaths } from "../../../src/kilocode/server/httpapi/groups/config-console"
import { IndexingPaths, LegionEmbeddingModel } from "../../../src/kilocode/server/httpapi/groups/indexing"
import { KilocodePaths } from "../../../src/kilocode/server/httpapi/groups/kilocode"
import { NetworkPaths } from "../../../src/kilocode/server/httpapi/groups/network"
import { TelemetryPaths } from "../../../src/kilocode/server/httpapi/groups/telemetry"
import { ExperimentalPaths } from "../../../src/server/routes/instance/httpapi/groups/experimental"
import { SessionPaths } from "../../../src/server/routes/instance/httpapi/groups/session"
import { PublicApi } from "../../../src/server/routes/instance/httpapi/public"

type Schema = {
  anyOf?: Schema[]
  items?: Schema
  properties?: Record<string, Schema>
  type?: string
  enum?: string[]
  minLength?: number
  maxLength?: number
  pattern?: string
}

type Parameter = {
  in?: string
  name?: string
  schema?: Schema
}

type Method = "get" | "post" | "patch" | "put"

type Body = {
  content?: Record<string, { schema?: Schema }>
}

describe("Legion PublicApi OpenAPI contract", () => {
  test("uses Legion branding", () => {
    const spec = OpenApi.fromApi(PublicApi)
    expect(spec.info.title).toBe("legion")
    expect(spec.info.description).toBe("Legion api")
  })

  test("constrains embedding model metadata", () => {
    const accepts = (dimension: number, scoreThreshold: number) =>
      Result.isSuccess(
        EffectSchema.decodeUnknownResult(LegionEmbeddingModel)({
          id: "provider/model",
          name: "Model",
          dimension,
          scoreThreshold,
        }),
      )

    expect(accepts(1, 0)).toBe(true)
    expect(accepts(1024, 1)).toBe(true)
    expect(accepts(0, 0.5)).toBe(false)
    expect(accepts(1.5, 0.5)).toBe(false)
    expect(accepts(1024, -0.1)).toBe(false)
    expect(accepts(1024, 1.1)).toBe(false)
  })

  test("constrains agent builder route ids", () => {
    const spec = OpenApi.fromApi(PublicApi)
    const save = AgentBuilderPaths.save.replace(":id", "{id}")
    const params = spec.paths[save]?.put?.parameters as Parameter[] | undefined
    const schema = params?.find((param) => param.name === "id")?.schema

    expect(schema).toEqual({
      type: "string",
      minLength: 1,
      maxLength: 64,
      pattern: "^[a-zA-Z0-9][a-zA-Z0-9._-]*$",
    })
  })

  test("keeps workspace routing queries on background process routes", () => {
    const spec = OpenApi.fromApi(PublicApi)
    const routes = [
      { method: "get", path: BackgroundProcessPaths.list },
      { method: "get", path: BackgroundProcessPaths.get },
      { method: "get", path: BackgroundProcessPaths.logs },
      { method: "post", path: BackgroundProcessPaths.stop },
      { method: "post", path: BackgroundProcessPaths.restart },
      { method: "post", path: BackgroundProcessPaths.stopSession },
    ] satisfies Array<{ method: Method; path: string }>

    for (const route of routes) {
      const path = route.path.replace(/:([A-Za-z0-9_]+)/g, "{$1}")
      const params = spec.paths[path]?.[route.method]?.parameters as Parameter[] | undefined
      const query = params?.filter((param) => param.in === "query").map((param) => param.name)
      expect(query, `${route.method.toUpperCase()} ${route.path}`).toEqual(["directory", "workspace"])
    }
  })

  test("keeps directory routing queries on Kilo Console routes", () => {
    const spec = OpenApi.fromApi(PublicApi)
    const routes = [
      { method: "get", path: ExperimentalPaths.worktreeDiff },
      { method: "get", path: ExperimentalPaths.worktreeDiffSummary },
      { method: "get", path: ExperimentalPaths.worktreeDiffFile },
      { method: "post", path: SessionPaths.viewed },
      { method: "get", path: ConfigConsolePaths.overlay },
      { method: "patch", path: ConfigConsolePaths.overlay },
      { method: "get", path: IndexingPaths.status },
      { method: "get", path: IndexingPaths.models },
    ] satisfies Array<{ method: Method; path: string }>

    for (const route of routes) {
      const params = spec.paths[route.path]?.[route.method]?.parameters as Parameter[] | undefined
      const query = params?.filter((param) => param.in === "query").map((param) => param.name)
      expect(query, `${route.method.toUpperCase()} ${route.path}`).toContain("directory")
      expect(query, `${route.method.toUpperCase()} ${route.path}`).toContain("workspace")
    }
  })

  test("keeps workspace routing queries on all Kilo-owned routed endpoints", () => {
    const spec = OpenApi.fromApi(PublicApi)
    const routes = [
      { method: "post", path: AgentBuilderPaths.preview },
      { method: "put", path: AgentBuilderPaths.save },
      { method: "post", path: "/commit-message" },
      { method: "post", path: "/enhance-prompt" },
      { method: "get", path: NetworkPaths.list },
      { method: "post", path: NetworkPaths.reply },
      { method: "post", path: NetworkPaths.reject },
      { method: "post", path: TelemetryPaths.capture },
      { method: "post", path: TelemetryPaths.setEnabled },
      { method: "get", path: ConfigConsolePaths.sources },
      { method: "get", path: ConfigConsolePaths.effective },
      { method: "get", path: ConfigConsolePaths.rules },
      { method: "put", path: ConfigConsolePaths.rules },
      { method: "get", path: ConfigConsolePaths.modelState },
      { method: "patch", path: ConfigConsolePaths.modelState },
      { method: "get", path: ConfigConsolePaths.tuiConfig },
      { method: "get", path: ConfigConsolePaths.tuiKeybinds },
      { method: "patch", path: ConfigConsolePaths.tuiConfig },
      { method: "get", path: KilocodePaths.sessionModelUsage },
    ] satisfies Array<{ method: Method; path: string }>

    for (const route of routes) {
      const path = route.path.replace(/:([A-Za-z0-9_]+)/g, "{$1}")
      const params = spec.paths[path]?.[route.method]?.parameters as Parameter[] | undefined
      const query = params?.filter((param) => param.in === "query").map((param) => param.name)
      expect(query, `${route.method.toUpperCase()} ${route.path}`).toContain("directory")
      expect(query, `${route.method.toUpperCase()} ${route.path}`).toContain("workspace")
    }
  })

  test.skip("keeps personal organization resets nullable (skipped — KiloGateway removed)", () => {
    const spec = OpenApi.fromApi(PublicApi)
    const body = spec.paths["/organization"]?.post?.requestBody as Body | undefined
    const schema = body?.content?.["application/json"]?.schema
    const props = schema?.properties
    expect(props?.organizationId).toEqual({ anyOf: [{ type: "string" }, { type: "null" }] })
  })

  test.skip("keeps Kilo gateway responses nullable (skipped — KiloGateway removed)", () => {
    const spec = OpenApi.fromApi(PublicApi)
    const response = (path: string) => {
      const body = spec.paths[path]?.get?.responses?.["200"] as Body | undefined
      return body?.content?.["application/json"]?.schema
    }

    expect(response("/profile")?.properties).toBeDefined()
    expect(response("/auth-status")?.properties).toBeDefined()
    expect(response("/cloud-sessions")?.properties).toBeDefined()
    expect(response("/claw-status")?.properties).toBeDefined()
    expect(response("/claw-chat-credentials")).toBeDefined()
  })

  test.skip("keeps transcription prompts in the public contract (skipped — KiloGateway removed)", () => {
    const spec = OpenApi.fromApi(PublicApi)
    const body = spec.paths["/audio-transcriptions"]?.post?.requestBody as Body | undefined
    const schema = body?.content?.["application/json"]?.schema
    expect(schema?.properties?.prompt).toEqual({ type: "string" })
  })
})
