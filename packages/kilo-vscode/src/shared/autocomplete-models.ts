export type AutocompleteProviderID = string

export interface AutocompleteModelDef {
  kind: "fim" | "edit"
  id: string
  name: string
  provider: string
  providerID: string
  modelID: string
  fimModelID: string
  label?: string
  requestModel?: string
  temperature?: number
}

export const AUTOCOMPLETE_MODELS: AutocompleteModelDef[] = []
export const DEFAULT_AUTOCOMPLETE_MODEL: AutocompleteModelDef = {
  kind: "fim",
  id: "",
  name: "",
  provider: "",
  providerID: "",
  modelID: "",
  fimModelID: "",
}

export function getAutocompleteModel(
  _provider?: string,
  _model?: string,
): AutocompleteModelDef {
  return { kind: "fim", id: "", name: "", provider: "", providerID: "", modelID: "", fimModelID: "" }
}

export function getAutocompleteModelById(
  _id: string,
): AutocompleteModelDef {
  return { kind: "fim", id: "", name: "", provider: "", providerID: "", modelID: "", fimModelID: "" }
}

export function validAutocompleteModel(_model?: string): boolean {
  return false
}

export function validAutocompleteProvider(_provider?: string): boolean {
  return false
}
