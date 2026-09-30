import { InstallationVersion } from "@opencode-ai/core/installation/version"

export const DEFAULT_HEADERS = {
  "HTTP-Referer": "https://legion.ai",
  "X-Title": "legion",
  "User-Agent": `Legion/${InstallationVersion}`,
}

/** OpenCode Zen console: the device login endpoint, and the only account whose token is valid there. */
export const OPENCODE_SERVER = "https://console.opencode.ai"

/**
 * Origin that actually serves the console web UI.
 *
 * The device endpoints live on {@link OPENCODE_SERVER}, but that host only
 * redirects: `console.opencode.ai/<path>` 302s to `opencode.ai/console/<path>`.
 * The `verification_uri_complete` the device endpoint returns is therefore a
 * path relative to this origin (it already starts with `/console`), so joining
 * it onto `OPENCODE_SERVER` yields a doubled `/console/console/device` that the
 * console SPA answers with its 404 route.
 */
export const OPENCODE_CONSOLE = "https://opencode.ai"
