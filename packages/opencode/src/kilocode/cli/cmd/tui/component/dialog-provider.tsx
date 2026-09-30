/**
 * Kilo-specific overrides for the provider dialog.
 *
 * Exports constants and renderers consumed by the shared upstream
 * `dialog-provider.tsx` so the upstream diff stays minimal.
 */

import type { JSX } from "solid-js"
import type { RGBA } from "@opentui/core"
import type { ProviderAuthAuthorization } from "@legion/sdk/v2"
import { Log } from "@opencode-ai/core/util/log"
import open from "open"
export { selectProvider } from "@/kilocode/anaconda-desktop/tui/setup"

const log = Log.create({ service: "tui.dialog-provider" })

// ---------------------------------------------------------------------------
// Failed-state gutter/description helpers
// ---------------------------------------------------------------------------

/**
 * Returns a red `!` gutter element when the provider is in a failed auth state,
 * or `undefined` if not failed and not connected (falls through to default check).
 */
export function renderGutter(
  providerID: string,
  failed: string[],
  theme: { error: RGBA },
): (() => JSX.Element) | undefined {
  if (!failed.includes(providerID)) return undefined
  return () => <text fg={theme.error}>!</text>
}

/**
 * Returns a description suffix when the provider has encountered an error,
 * or `undefined` to leave the default description unchanged.
 */
export function failedDescription(providerID: string, failed: string[]): string | undefined {
  if (!failed.includes(providerID)) return undefined
  return "(connection error — click to reconnect)"
}

// ---------------------------------------------------------------------------
// Provider priority (replaces upstream map entirely)
// ---------------------------------------------------------------------------

export const PROVIDER_PRIORITY: Record<string, number> = {
  anthropic: 0,
  "github-copilot": 1,
  openai: 2,
  google: 3,
  opencode: 4,
  "anaconda-desktop": 5,
}

// ---------------------------------------------------------------------------
// Provider descriptions shown next to the name in the selection list
// ---------------------------------------------------------------------------

export const PROVIDER_DESCRIPTIONS: Record<string, string> = {
  anthropic: "(Claude Max or API key)",
  openai: "(ChatGPT login or API key)",
  // OpenCode's own free tier is reserved for their clients and is rejected here
  // with a FreeTierError, so don't advertise it — a Zen account unlocks paid models.
  opencode: "(OpenCode account or API key)",
  "anaconda-desktop": "(Local models)",
}

export const PROVIDER_TITLES: Record<string, string> = {
  openai: "OpenAI / Codex",
  opencode: "OpenCode Zen",
}

// ---------------------------------------------------------------------------
// Console-managed providers
// ---------------------------------------------------------------------------

/**
 * Explains why selecting a console-managed provider does nothing.
 *
 * The dialog deliberately refuses to open the credential flow for a provider
 * the console owns, because the console already supplies its credential (see
 * `onSelect` in the shared dialog). When the account reports no org name the
 * row also renders no footer, so pressing enter looks like a dead keypress.
 */
export function consoleManagedMessage(input: { title: string; orgName?: string }) {
  const org = input.orgName ? ` your ${input.orgName} console org` : " your console account"
  return `${input.title} is managed by${org} — pick one of its models to start a session.`
}

/**
 * Footer for a console-managed row. The server omits `activeOrgName` when the
 * account has no org name, which would otherwise leave the row with no hint at
 * all that it is not interactive.
 */
export function consoleManagedFooter(orgName?: string) {
  return orgName ?? "Managed by console"
}

/** Local OpenAI-compatible providers where API key is optional (localhost). */
export const LOCAL_OPTIONAL_API_KEY = new Set(["atomic-chat", "lmstudio"])

export function isLocalOptionalApiKey(providerID: string) {
  return LOCAL_OPTIONAL_API_KEY.has(providerID)
}

export const LOCAL_API_KEY_PLACEHOLDER = "local"

// ---------------------------------------------------------------------------
// Auto-method renderer
// ---------------------------------------------------------------------------

/**
 * Returns `undefined` for all providers so the caller falls through to the
 * default `AutoMethod`.
 */
export function renderAutoMethod(_opts: {
  providerID: string
  title: string
  index: number
  authorization: ProviderAuthAuthorization
  useSDK: () => any
  useTheme: () => any
  DialogModel: any
}): (() => JSX.Element) | undefined {
  return undefined
}

/**
 * Opens the device authorization page for OpenCode Zen. The dialog always shows
 * the URL, so a failure here is not fatal — log it and let the user copy it.
 */
export function openAuthorization(providerID: string, url: string | undefined) {
  if (providerID !== "opencode" || !url) return
  void open(url).catch((err) => {
    log.warn("failed to open opencode device authorization page", { error: err })
  })
}

// ---------------------------------------------------------------------------
// API-key dialog description
// ---------------------------------------------------------------------------

/**
 * Returns a custom description element for the API-key dialog.
 */
export function renderApiDescription(
  providerID: string,
  theme: { textMuted: RGBA; text: RGBA; primary: RGBA },
): (() => JSX.Element) | undefined {
  if (providerID === "atomic-chat") {
    return () => (
      <text fg={theme.textMuted}>
        Connect to Atomic Chat on this machine (default http://127.0.0.1:1337). Leave API key empty for local server.
      </text>
    )
  }
  return undefined
}

export function apiKeyPlaceholder(providerID: string) {
  return isLocalOptionalApiKey(providerID) ? "Optional for localhost" : "API key"
}
