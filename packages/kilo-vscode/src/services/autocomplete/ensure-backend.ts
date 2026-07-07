import * as vscode from "vscode"
import type { BlitxConnectionService } from "../cli-backend"

/**
 * Start the CLI backend if autocomplete is enabled and a workspace folder exists.
 * Idempotent — connectionService.connect() deduplicates concurrent calls.
 */
export function ensureBackendForAutocomplete(connection: BlitxConnectionService): void {
  const enabled =
    vscode.workspace.getConfiguration("blitx-code.new.autocomplete").get<boolean>("enableAutoTrigger") ?? true
  const dir = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
  if (!enabled || !dir) return
  connection.connect(dir).catch((err) => {
    console.error("[Blitx] Autocomplete: Failed to start CLI backend:", err)
  })
}
