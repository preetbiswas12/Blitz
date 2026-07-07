export type BlitxEmbeddingModel = {
  id: string
  name: string
  dimension: number
  scoreThreshold: number
  note?: string
}

export type BlitxEmbeddingModelCatalog = {
  defaultModel: string
  models: BlitxEmbeddingModel[]
  aliases: Record<string, string>
}

export const EMPTY_BLITX_EMBEDDING_MODEL_CATALOG: BlitxEmbeddingModelCatalog = {
  defaultModel: "",
  models: [],
  aliases: {},
}

export function normalizeBlitxEmbeddingModelId(model: string | undefined, catalog = EMPTY_BLITX_EMBEDDING_MODEL_CATALOG) {
  if (!model) return undefined
  return catalog.aliases[model] ?? model
}

export function getBlitxEmbeddingModel(model: string | undefined, catalog = EMPTY_BLITX_EMBEDDING_MODEL_CATALOG) {
  const id = normalizeBlitxEmbeddingModelId(model, catalog)
  return catalog.models.find((item) => item.id === id)
}

export function formatBlitxEmbeddingModelLabel(model: BlitxEmbeddingModel): string {
  const note = model.note ? `${model.note}, ` : ""
  return `${model.name} (${note}${model.dimension}d)`
}
