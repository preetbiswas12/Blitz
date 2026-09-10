import { createMemo, createSignal, Show } from "solid-js"
import { useTerminalDimensions } from "@opentui/solid"
import { pipe, sortBy, filter, map, entries, flatMap } from "remeda"
import { DialogSelect } from "@tui/ui/dialog-select"
import { useDialog } from "@tui/ui/dialog"
import { useLocal } from "@tui/context/local"
import { useSync } from "@tui/context/sync"
import { ModelInfoPanel } from "@/kilocode/components/model-info-panel"
import { FreeModelDisclosure } from "@/kilocode/components/free-model-disclosure"
import { useConnected } from "@/cli/cmd/tui/component/use-connected"
import { DialogProvider } from "@/cli/cmd/tui/component/dialog-provider"
import { DialogVariant } from "@/cli/cmd/tui/component/dialog-variant"
import { useTheme } from "@tui/context/theme"
import type { Model } from "@legion/sdk/v2"

export function sortModelOptions<
  T extends {
    footer?: string
    releaseDate: string
    title: string
    value?: { providerID: string; modelID: string }
  },
>(
  options: T[],
  newestFirst: boolean,
  rank: ReadonlyMap<string, number> = new Map(),
) {
  const recommended = (option: T) =>
    option.value?.providerID === "kilo" ? (rank.get(option.value.modelID) ?? Infinity) : 0
  if (newestFirst)
    return sortBy(
      options,
      recommended,
      [(option) => option.releaseDate, "desc"],
      (option) => option.title,
    )
  return sortBy(
    options,
    recommended,
    (option) => option.footer === undefined,
    (option) => option.title,
  )
}

export function DialogModel(props: { providerID?: string }) {
  const local = useLocal()
  const sync = useSync()
  const dialog = useDialog()
  const { theme } = useTheme()
  const dimensions = useTerminalDimensions()
  const connected = useConnected()

  const wide = createMemo(() => dimensions().width >= 108)
  const [preview, setPreview] = createSignal<{ model: Model; provider: string }>()

  const lookup = (providerID: string, modelID: string) => {
    const provider = sync.data.provider.find((x) => x.id === providerID)
    const model = provider?.models[modelID]
    if (!provider || !model) return
    return { model, provider: provider.name }
  }

  const kiloRank = createMemo(() => {
    const provider = sync.data.provider.find((p) => p.id === "kilo")
    const models = provider?.models ?? {}
    return new Map(Object.entries(models).map(([id, info]) => [id, info.recommendedIndex ?? Infinity] as const))
  })

  const showExtra = createMemo(() => connected() && !props.providerID)

  const footer = (providerID: string, model: Model) => {
    const labels = [
      providerID === "kilo" && FreeModelDisclosure.hasByok(model) ? FreeModelDisclosure.byok : undefined,
      providerID === "kilo" && FreeModelDisclosure.collectsData(model) ? FreeModelDisclosure.label : undefined,
      model.cost?.input === 0 && providerID === "opencode" ? "Free" : undefined,
    ].filter((label) => label !== undefined)
    return labels.length > 0 ? labels.join(" · ") : undefined
  }

  const options = createMemo(() => {
    const current = local.model.current()
    const favorites = connected() ? local.model.favorite() : []
    const recents = local.model.recent()

    function toOptions(items: typeof favorites, category: string) {
      if (!showExtra()) return []
      return items.flatMap((item) => {
        const provider = sync.data.provider.find((x) => x.id === item.providerID)
        if (!provider) return []
        const model = provider.models[item.modelID]
        if (!model) return []
        return [
          {
            key: item,
            value: { providerID: provider.id, modelID: model.id },
            title: model.name ?? item.modelID,
            description: provider.name,
            category,
            disabled: provider.id === "opencode" && model.id.includes("-nano"),
            footer: footer(provider.id, model),
            onSelect: () => {
              selectModel(provider.id, model.id)
            },
          },
        ]
      })
    }

    const favoriteOptions = toOptions(favorites, "Favorites")
    const recentOptions = toOptions(
      recents.filter(
        (item) => !favorites.some((fav) => fav.providerID === item.providerID && fav.modelID === item.modelID),
      ),
      "Recent",
    )

    const providerOptions = pipe(
      sync.data.provider,
      sortBy(
        (provider) => provider.id !== "opencode",
        (provider) => provider.name,
      ),
      flatMap((provider) =>
        pipe(
          provider.models,
          entries(),
          filter(([_, info]) => info.status !== "deprecated"),
          filter(([_, info]) => (props.providerID ? info.providerID === props.providerID : true)),
          map(([model, info]) => ({
            value: { providerID: provider.id, modelID: model },
            title: info.name ?? model,
            releaseDate: info.release_date,
            description: favorites.some(
              (item) => item.providerID === provider.id && item.modelID === model,
            )
              ? "(Favorite)"
              : undefined,
            category: connected()
              ? provider.id === "kilo" && info.recommendedIndex !== undefined
                ? "Recommended"
                : provider.name
              : undefined,
            disabled: provider.id === "opencode" && model.includes("-nano"),
            footer: footer(provider.id, info),
            onSelect() {
              selectModel(provider.id, model)
            },
          })),
          filter((x) => {
            if (showExtra()) {
              if (
                favorites.some(
                  (item) =>
                    item.providerID === x.value.providerID && item.modelID === x.value.modelID,
                )
              )
                return false
              if (
                recents.some(
                  (item) =>
                    item.providerID === x.value.providerID && item.modelID === x.value.modelID,
                )
              )
                return false
            }
            return true
          }),
          (opts) => sortModelOptions(opts, props.providerID !== undefined, kiloRank()),
        ),
      ),
    )

    return [...favoriteOptions, ...recentOptions, ...providerOptions]
  })

  const provider = createMemo(() =>
    props.providerID ? sync.data.provider.find((x) => x.id === props.providerID) : null,
  )

  const title = createMemo(() => {
    const value = provider()
    if (!value) return "Select model"
    return value.name
  })

  function selectModel(providerID: string, modelID: string) {
    local.model.set({ providerID, modelID }, { recent: true })
    const list = local.model.variant.list()
    const cur = local.model.variant.selected()
    if (cur === "default" || (cur && list.includes(cur))) {
      dialog.clear()
      return
    }
    if (list.length > 0) {
      dialog.replace(() => <DialogVariant />)
      return
    }
    dialog.clear()
  }

  return (
    <box flexDirection="row">
      <box flexGrow={1} flexShrink={1}>
        <DialogSelect<ReturnType<typeof options>[number]["value"]>
          title={`${title()} (${options().length})`}
          placeholder="Search models..."
          options={options()}
          flat={!!props.providerID}
          current={local.model.current()}
          actions={[
            {
              command: "model.dialog.provider",
              title: connected() ? "Connect provider" : "View all providers",
              onTrigger: () => {
                dialog.replace(() => <DialogProvider />)
              },
            },
            {
              command: "model.dialog.favorite",
              title: "Favorite",
              disabled: !connected(),
              onTrigger: (option) => {
                local.model.toggleFavorite(option.value as { providerID: string; modelID: string })
              },
            },
          ]}
          onMove={(option) => {
            if (typeof option.value === "string") {
              setPreview(undefined)
              return
            }
            const next = lookup(option.value.providerID, option.value.modelID)
            if (!next) return
            setPreview(next)
          }}
          onSelect={(option) => {
            if (typeof option.value !== "string") {
              selectModel(option.value.providerID, option.value.modelID)
            }
          }}
        />
      </box>
      <Show when={wide() && preview()}>
        {(p) => (
          <ModelInfoPanel model={p().model} provider={p().provider} />
        )}
      </Show>
    </box>
  )
}
