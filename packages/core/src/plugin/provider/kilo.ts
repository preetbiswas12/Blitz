import { Effect } from "effect"
import { PluginV2 } from "../../plugin"
import { ProviderV2 } from "../../provider" // kilocode_change

const KILO_OPENROUTER_BASE = "https://openrouter.kilo.ai/api/v1" // kilocode_change

function createKilo(_options: unknown): unknown {
  return undefined
}

const id = ProviderV2.ID.make("blitx") // kilocode_change

export const KiloPlugin = PluginV2.define({
  id: PluginV2.ID.make("blitx"),
  effect: Effect.gen(function* () {
    return {
      "catalog.transform": Effect.fn(function* (evt) {
        for (const item of evt.provider.list()) {
          if (item.provider.id !== id) continue // kilocode_change
          evt.provider.update(item.provider.id, (provider) => {
            // kilocode_change start
            const options = provider.options.aisdk.provider
            const token = options.kilocodeToken ?? options.apiKey ?? process.env.KILO_API_KEY
            const org = process.env.KILO_ORG_ID ?? options.kilocodeOrganizationId

            provider.endpoint = {
              type: "aisdk",
              package: "@ai-sdk/openai-compatible",
              url: KILO_OPENROUTER_BASE,
            }
            // kilocode_change end
            provider.options.headers["HTTP-Referer"] = "https://blitx.ai/"
            // kilocode_change start
            provider.options.headers["X-Title"] = "Blitx Code"
            options.kilocodeToken = token ?? "anonymous"
            if (org) options.kilocodeOrganizationId = org
            if (!provider.enabled) provider.enabled = { via: "custom", data: { anonymous: true } }
            // kilocode_change end
          })
        }
      }),
      // kilocode_change start
      "aisdk.sdk": Effect.fn(function* (evt) {
        if (evt.model.providerID !== id) return
        evt.sdk = createKilo(evt.options)
      }),
      // kilocode_change end
    }
  }),
})
