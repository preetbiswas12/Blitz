export type LegionEmbeddingModel = {
  id: string
  name: string
  dimension: number
  scoreThreshold: number
  note?: string
}

export type LegionEmbeddingModelCatalog = {
  defaultModel: string
  models: LegionEmbeddingModel[]
  aliases: Record<string, string>
}

export const EMPTY_LEGION_EMBEDDING_MODEL_CATALOG: LegionEmbeddingModelCatalog = {
  defaultModel: "",
  models: [],
  aliases: {},
}

export function normalizeLegionEmbeddingModelId(model: string | undefined, catalog = EMPTY_LEGION_EMBEDDING_MODEL_CATALOG) {
  if (!model) return undefined
  return catalog.aliases[model] ?? model
}

export function getLegionEmbeddingModel(model: string | undefined, catalog = EMPTY_LEGION_EMBEDDING_MODEL_CATALOG) {
  const id = normalizeLegionEmbeddingModelId(model, catalog)
  return catalog.models.find((item) => item.id === id)
}

export function formatLegionEmbeddingModelLabel(model: LegionEmbeddingModel): string {
  const note = model.note ? `${model.note}, ` : ""
  return `${model.name} (${note}${model.dimension}d)`
}
