import { createContext, createSignal, onCleanup, useContext, type Accessor, type ParentComponent } from "solid-js"
import {
  EMPTY_BLITX_EMBEDDING_MODEL_CATALOG,
  type BlitxEmbeddingModelCatalog,
} from "@blitxcode/kilo-indexing/embedding-models"
import { useVSCode } from "./vscode"
import type { ExtensionMessage } from "../types/messages"

type BlitxEmbeddingModelsContextValue = {
  catalog: Accessor<BlitxEmbeddingModelCatalog>
}

export const BlitxEmbeddingModelsContext = createContext<BlitxEmbeddingModelsContextValue>()

export const BlitxEmbeddingModelsProvider: ParentComponent = (props) => {
  const vscode = useVSCode()
  const [catalog, setCatalog] = createSignal<BlitxEmbeddingModelCatalog>(EMPTY_BLITX_EMBEDDING_MODEL_CATALOG)

  const unsubscribe = vscode.onMessage((message: ExtensionMessage) => {
    if (message.type !== "blitxEmbeddingModelsLoaded") return
    setCatalog(message.catalog)
  })

  vscode.postMessage({ type: "requestBlitxEmbeddingModels" })

  onCleanup(unsubscribe)

  return <BlitxEmbeddingModelsContext.Provider value={{ catalog }}>{props.children}</BlitxEmbeddingModelsContext.Provider>
}

export function useBlitxEmbeddingModels(): BlitxEmbeddingModelsContextValue {
  const context = useContext(BlitxEmbeddingModelsContext)
  if (!context) {
    throw new Error("useBlitxEmbeddingModels must be used within a BlitxEmbeddingModelsProvider")
  }
  return context
}
