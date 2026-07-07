import { MAX_ITEM_TOKENS } from "../constants"
import type { EmbedderInfo, EmbeddingResponse, IEmbedder } from "../interfaces/embedder"
import { Log } from "../../util/log"
import { OpenAICompatibleEmbedder } from "./openai-compatible"

const HEADER_FEATURE = "X-Kilo-Feature"
const HEADER_ORGANIZATIONID = "X-Kilo-OrganizationId"

function resolveKiloGatewayBaseUrl(opts: { baseURL?: string; token?: string }): string {
  return opts.baseURL ?? "https://gateway.kilo.ai"
}

const log = Log.create({ service: "embedder-kilo" })

export const KILO_INDEXING_FEATURE = "managed-indexing"

export class KiloEmbedder implements IEmbedder {
  private readonly embedder: OpenAICompatibleEmbedder
  private readonly model: string

  constructor(input: {
    apiKey: string
    baseUrl?: string
    organizationId?: string
    modelId?: string
    dimensions?: number
  }) {
    if (!input.apiKey) throw new Error("Blitx API key is required for embedding.")

    if (!input.modelId) throw new Error("Blitx embedding model is required.")
    this.model = input.modelId
    const headers: Record<string, string> = {
      [HEADER_FEATURE]: KILO_INDEXING_FEATURE,
      ...(input.organizationId ? { [HEADER_ORGANIZATIONID]: input.organizationId } : {}),
    }

    this.embedder = new OpenAICompatibleEmbedder(
      resolveKiloGatewayBaseUrl({ baseURL: input.baseUrl, token: input.apiKey }),
      input.apiKey,
      this.model,
      MAX_ITEM_TOKENS,
      { headers, dimensions: input.dimensions },
    )
  }

  async createEmbeddings(texts: string[], model?: string): Promise<EmbeddingResponse> {
    try {
      return await this.embedder.createEmbeddings(texts, model || this.model)
    } catch (err) {
      log.error("Blitx embedder error", {
        err: err instanceof Error ? err.message : String(err),
        location: "BlitxEmbedder:createEmbeddings",
      })
      throw err
    }
  }

  async validateConfiguration(): Promise<{ valid: boolean; error?: string }> {
    try {
      return await this.embedder.validateConfiguration()
    } catch (err) {
      log.error("Blitx embedder validation error", {
        err: err instanceof Error ? err.message : String(err),
        location: "BlitxEmbedder:validateConfiguration",
      })
      throw err
    }
  }

  get embedderInfo(): EmbedderInfo {
    return { name: "kilo" }
  }
}
