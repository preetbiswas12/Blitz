import { describe, it, expect, beforeEach } from "bun:test"
import { Effect } from "effect"
import { KiloGateway } from "@legion/kilocode"

describe("KiloGateway", () => {
  beforeEach(() => {
    delete process.env.KILO_API_KEY
    delete process.env.KILO_ORG_ID
  })

  describe("fetchModels", () => {
    it("returns empty models when no token is provided", async () => {
      const result = await KiloGateway.fetchModels({}).pipe(Effect.runPromise)
      expect(result.models).toEqual({})
      expect(result.error).toBeUndefined()
    })

    it("returns models on successful fetch", async () => {
      const mockData = {
        data: [
          { id: "model-1", name: "Model 1" },
          { id: "model-2", name: "Model 2" },
        ],
      }
      const originalFetch = globalThis.fetch
      globalThis.fetch = async () =>
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any

      const result = await KiloGateway.fetchModels({ token: "test-key" }).pipe(Effect.runPromise)
      expect(result.models).toEqual({ "model-1": mockData.data[0], "model-2": mockData.data[1] })
      expect(result.error).toBeUndefined()

      globalThis.fetch = originalFetch
    })

    it("returns empty models on 401", async () => {
      const originalFetch = globalThis.fetch
      globalThis.fetch = async () =>
        new Response(null, {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }) as any

      const result = await KiloGateway.fetchModels({ token: "bad-key" }).pipe(Effect.runPromise)
      expect(result.models).toEqual({})
      expect(result.error).toBe("unauthorized")

      globalThis.fetch = originalFetch
    })

    it("sends Authorization header when token is provided", async () => {
      let capturedHeaders: Record<string, string> = {}
      const originalFetch = globalThis.fetch
      globalThis.fetch = async (_url: string, init: any) => {
        capturedHeaders = init.headers
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      }

      await KiloGateway.fetchModels({ token: "my-secret-key" }).pipe(Effect.runPromise)
      expect(capturedHeaders["Authorization"]).toBe("Bearer my-secret-key")

      globalThis.fetch = originalFetch
    })

    it("sends X-Kilo-OrganizationId header when organizationId is provided", async () => {
      let capturedHeaders: Record<string, string> = {}
      const originalFetch = globalThis.fetch
      globalThis.fetch = async (_url: string, init: any) => {
        capturedHeaders = init.headers
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      }

      await KiloGateway.fetchModels({
        token: "my-secret-key",
        organizationId: "org-123",
      }).pipe(Effect.runPromise)
      expect(capturedHeaders["X-Kilo-OrganizationId"]).toBe("org-123")

      globalThis.fetch = originalFetch
    })

    it("does not send Authorization header when token is missing", async () => {
      let capturedHeaders: Record<string, string> = {}
      const originalFetch = globalThis.fetch
      globalThis.fetch = async (_url: string, init: any) => {
        capturedHeaders = init.headers
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      }

      await KiloGateway.fetchModels({}).pipe(Effect.runPromise)
      expect(capturedHeaders["Authorization"]).toBeUndefined()

      globalThis.fetch = originalFetch
    })
  })
})
