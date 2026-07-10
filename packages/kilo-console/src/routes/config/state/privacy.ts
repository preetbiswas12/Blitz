import type { Model, Provider } from "@legion/sdk/v2/client"

export function hasGateway(providers: Pick<Provider, "id">[]) {
  return providers.some((provider) => provider.id === "legion")
}

export function visible(
  provider: Pick<Provider, "id">,
  model: Pick<Model, "mayTrainOnYourPrompts">,
  privacy: boolean,
) {
  return !privacy || provider.id !== "legion" || model.mayTrainOnYourPrompts !== true
}
