import { InstallationChannel, InstallationVersion } from "@opencode-ai/core/installation/version"
import { Flag } from "@opencode-ai/core/flag/flag"

export const DEFAULT_HEADERS = {
  "HTTP-Referer": "https://legion.ai",
  "X-Title": "legion",
  "User-Agent": `Legion/${InstallationVersion}`,
}

/**
 * User-Agent for every request to the OpenCode Zen API (`opencode` provider).
 *
 * The OpenCode backend only serves its free tier to clients that identify as
 * the opencode CLI, so the `opencode` provider must send this instead of the
 * Legion user agent. Mirrors the user agent core sends to models.dev.
 */
export const OPENCODE_USER_AGENT = `opencode/${InstallationChannel}/${InstallationVersion}/${Flag.LEGION_CLIENT}`

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
