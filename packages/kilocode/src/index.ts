import { Effect } from "effect"
export { KiloGatewayOptions, KiloModel, KiloModelsResponse } from "./types"

export namespace KiloGateway {
  const DEFAULT_BASE_URL = "https://gateway.kilo.ai"

  export function baseURL(options: { baseURL?: string }): string {
    return options.baseURL ?? DEFAULT_BASE_URL
  }

  export function fetchModels(options: {
    token?: string
    organizationId?: string
    baseURL?: string
  }): Effect.Effect<{ readonly models: Record<string, unknown>; readonly error?: string }, string> {
    if (!options.token) {
      return Effect.succeed({ models: {} })
    }

    const url = `${baseURL(options).replace(/\/+$/, "")}/v1/models`
    const headers: Record<string, string> = {}
    headers["Authorization"] = `Bearer ${options.token}`
    if (options.organizationId) headers["X-Kilo-OrganizationId"] = options.organizationId

    return Effect.tryPromise({
      try: () =>
        fetch(url, { headers }).then((res) => {
          if (res.status === 401) return { models: {}, error: "unauthorized" } as const
          if (!res.ok) throw new Error(`Kilo Gateway models fetch failed: ${res.status}`)
          return res.json()
        }),
      catch: () => "network-error",
    }).pipe(
      Effect.map((data: any) => {
        if (data.error) return data
        const models: Record<string, unknown> = {}
        const items = data?.data ?? []
        for (const item of items) {
          models[item.id] = item
        }
        return { models }
      }),
    )
  }
}
