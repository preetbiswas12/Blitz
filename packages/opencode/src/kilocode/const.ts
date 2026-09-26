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
