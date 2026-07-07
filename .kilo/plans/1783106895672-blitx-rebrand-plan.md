# Blitx CLI Rebrand Plan

## Summary
Rebrand "Kilo Code" → "Blitx", remove KiloClaw, and remove the Kilo Gateway (bring-your-own-key only).

## Decisions
- **Product name**: Blitx
- **npm scope**: `@blitxcode/*`
- **CLI binary**: `blitx`
- **Config paths**: `.blitx/`, `~/.blitx/`, `~/.config/blitx/` (no legacy `.kilo` support)
- **KiloClaw**: Fully removed
- **Kilo Gateway**: Fully removed (auth, profile, teams, remote, cloud sessions, notifications, FIM, model proxy). Users bring their own API keys.
- **Provider system**: Keep multi-provider BYOK (Anthropic, OpenAI, Google, etc). Remove the `kilo` provider that routes through `api.kilo.ai`. The existing `/connect` command already supports a provider-list → API-key → model-selection flow for all providers. Remove the `kilo` provider priority hint and keep the existing BYOK flow intact.

---

## Phase 1: Remove KiloClaw

### 1a. Delete TUI claw code
Delete `packages/opencode/src/kilocode/claw/` directory (10 files):
- `autocomplete.tsx`, `chat.tsx`, `client.ts`, `dialog-conversation-list.tsx`
- `event-service-client.ts`, `hooks.ts`, `kilo-chat-client.ts`, `sidebar.tsx`
- `types.ts`, `view.tsx`

### 1b. Delete claw-related components
Delete these files in `packages/opencode/src/kilocode/components/`:
- `dialog-claw-setup.tsx`
- `dialog-claw-upgrade.tsx`

### 1c. Delete VS Code extension kiloclaw webview
Delete `packages/kilo-vscode/webview-ui/kiloclaw/` directory (30+ files)

### 1d. Remove claw-related VS Code source
Delete `packages/kilo-vscode/src/kiloclaw/` directory (contains `kilo-chat-client.ts`)

### 1e. Remove claw route references
In `packages/opencode/src/cli/cmd/tui/context/route.tsx`: Remove the `"kiloclaw"` route type
In `packages/opencode/src/cli/cmd/tui/app.tsx`: Remove `<Match when={route.data.type === "kiloclaw"}>` block
In `packages/opencode/src/cli/cmd/tui/plugin/api.tsx`: Remove `kiloclaw` route check
In `packages/opencode/src/kilocode/cli/cmd/tui/app.tsx`: Remove claw route handling

### 1f. Remove claw slash command from kilo-commands.tsx
In `packages/opencode/src/kilocode/kilo-commands.tsx`: Remove the `/kiloclaw` command entry and claw imports

### 1g. Remove claw-related types from VS Code webview
In `packages/kilo-vscode/webview-ui/src/hooks/useSlashCommand.ts`: Remove `kiloclaw` entry

---

## Phase 2: Remove Kilo Gateway

### 2a. Delete gateway package
Delete `packages/kilo-gateway/` directory entirely

### 2b. Remove gateway auth plugin
In `packages/opencode/src/plugin/index.ts`:
- Remove `import { KiloAuthPlugin } from "@blitxcode/kilo-gateway"`
- Remove `KiloAuthPlugin` from plugin registration array

### 2c. Remove kilo provider
In `packages/opencode/src/kilocode/provider/provider.ts`:
- Remove `import { createKilo, ... } from "@blitxcode/kilo-gateway"`
- Remove `KILO_BUNDLED_PROVIDERS` export (or keep empty)
- Remove `kilo` entry from custom loaders
- Remove `kiloCustomLoaders` kilo entry
- Remove `kiloSmallModelPriority` (or return undefined always)
- Keep `patchCustomLoaderResult` but remove kilo-related cases
- Remove `patchKiloProviderPrivacy` (or make it no-op)

In `packages/opencode/src/provider/models.ts`:
- Remove gateway imports (`AI_SDK_PROVIDERS`, `KILO_OPENROUTER_BASE`, `PROMPTS`)
- Remove kilo provider creation from `get` function
- Remove `delete providers.kilo` line
- Remove allowed/disabled kilo checks
- Remove org/auth/kilo-specific logic

In `packages/opencode/src/config/provider.ts`:
- Remove `PROMPTS`, `AI_SDK_PROVIDERS` imports from `@blitxcode/kilo-gateway`

### 2d. Remove gateway HTTP API handlers
In `packages/opencode/src/kilocode/server/httpapi/server.ts`:
- Remove `kiloGatewayHandlers` import and registration

Delete `packages/opencode/src/kilocode/server/httpapi/handlers/kilo-gateway.ts`
Delete `packages/opencode/src/kilocode/server/httpapi/groups/kilo-gateway.ts`

### 2e. Remove gateway from session/LLM layer
In `packages/opencode/src/session/llm/request.ts`:
- Remove gateway imports
- Remove `isKilo` checks

In `packages/opencode/src/session/llm.ts`:
- Remove `isKilo` check

### 2f. Remove gateway from provider transform
In `packages/opencode/src/provider/transform.ts`:
- Remove `@blitxcode/kilo-gateway` case from switch statements and condition checks

### 2g. Remove gateway from model cache
In `packages/opencode/src/provider/model-cache.ts`:
- Remove `fetchKiloModels` import
- Remove kilo-specific cache logic

### 2h. Remove gateway from session export
In `packages/opencode/src/kilocode/session-export/eligibility.ts`:
- Remove `@blitxcode/kilo-gateway` npm check

### 2i. Remove gateway from config
In `packages/opencode/src/kilocode/config/config.ts`:
- Remove `fetchOrganizationModes` import and usage

### 2j. Remove gateway from indexing
In `packages/opencode/src/kilocode/indexing.ts`:
- Remove `fetchKiloEmbeddingModelCatalog` import and usage

### 2k. Remove gateway from CLI setup
In `packages/opencode/src/kilocode/cli/setup.ts`:
- Remove `migrateLegacyKiloAuth`, `ENV_FEATURE`, `ENV_VERSION` imports
- Remove legacy auth migration

### 2l. Remove gateway commands
In `packages/opencode/src/kilocode/kilo-commands.tsx`:
- Remove `/profile`, `/teams`, `/remote`, `/indexing` commands
- Remove all gateway imports

### 2m. Remove gateway components
Delete or gut these files:
- `packages/opencode/src/kilocode/components/dialog-kilo-profile.tsx`
- `packages/opencode/src/kilocode/components/dialog-kilo-team-select.tsx`
- `packages/opencode/src/kilocode/components/dialog-kilo-organization.tsx`
- `packages/opencode/src/kilocode/components/dialog-kilo-notifications.tsx`
- `packages/opencode/src/kilocode/components/notification-banner.tsx`
- `packages/opencode/src/kilocode/components/news.ts`
- `packages/opencode/src/kilocode/components/kilo-news.tsx`
- `packages/opencode/src/kilocode/components/indexing-dialog-state.ts`

### 2n. Remove gateway from VS Code extension
- `packages/kilo-vscode/src/KiloProvider.ts`: Remove `fetchKiloEmbeddingModelCatalog` import
- `packages/kilo-vscode/src/shared/autocomplete-models.ts`: Remove gateway autocomplete imports
- `packages/kilo-vscode/src/services/cli-backend/types.ts`: Remove profile types from gateway
- `packages/kilo-vscode/webview-ui/src/hooks/useSlashCommand.ts`: Remove gateway slash commands

### 2o. Remove gateway from sidebar footer
In `packages/opencode/src/kilocode/plugins/sidebar-footer.tsx`:
- Remove `KiloPassState` import

### 2p. Remove gateway from modes migrator
In `packages/opencode/src/kilocode/modes-migrator.ts`:
- Remove `OrganizationMode` import

### 2q. Remove gateway from kilo-sessions
In `packages/opencode/src/kilo-sessions/kilo-sessions.ts`:
- Remove `KILO_API_BASE` import and usage

### 2r. Remove gateway from profile command
Delete `packages/opencode/src/kilocode/cli/cmd/profile.ts`

### 2s. Remove gateway from TUI init
In `packages/opencode/src/kilocode/cli/cmd/tui/app.tsx`:
- Remove `initializeTUIDependencies` import from gateway

---

## Phase 3: Rebrand Kilo → Blitx

### 3a. Package names
- `packages/opencode/package.json`: `"name": "@blitxcode/cli"` → `"@blitxcode/cli"`
- `packages/opencode/package.json`: `"bin"` entries `kilo`/`kilocode` → `blitx`
- Root `package.json`: `"name": "@blitxcode/kilo"` → `"@blitxcode/blitx"`
- All `@blitxcode/*` workspace deps → `@blitxcode/*`
- `packages/kilo-vscode/package.json`: `"name": "kilo-code"` → `"blitx-code"`, publisher → `"blitxcode"`
- `packages/kilo-gateway/package.json` → deleted in Phase 2
- `packages/sdk/js/package.json`: Update name
- All other `@blitxcode/*` package.json files

### 3b. CLI binary
- `packages/opencode/bin/kilo` → rename to `packages/opencode/bin/blitx`
- Update shebang and references in build scripts

### 3c. Config paths
In `packages/opencode/src/kilocode/paths.ts`:
- `.kilocode` → `.blitxcode`, `.kilo` → `.blitx`
- `~/.kilocode` → `~/.blitxcode`, `~/.kilo` → `~/.blitx`
- `~/.config/kilo/` → `~/.config/blitx/`
- `kilocode.kilo-code` VS Code storage → `blitxcode.blitx-code`

In `packages/opencode/src/config/config.ts` and related config files:
- Update all `.kilo`, `.kilocode`, `.opencode` references

### 3d. Constants and branding
In `packages/opencode/src/kilocode/const.ts`:
- `"Kilo Code"` → `"Blitx"`, `"kilocode.ai"` → new domain or placeholder
- `"User-Agent"` header → `"Blitx/<version>"`

In `packages/kilo-gateway/src/api/constants.ts` → deleted in Phase 2

### 3e. CLI display strings
Search and replace across all source files:
- `"Kilo Code"` → `"Blitx"` (in user-facing strings, headers, welcome messages)
- `"Kilo CLI"` → `"Blitx CLI"`
- `"Kilo Gateway"` → remove or replace
- `"kilocode"` → `"blitxcode"` where used as identifier
- `"Kilo"` → `"Blitx"` in UI display text (dialog titles, labels, descriptions)

### 3f. VS Code extension rebrand
In `packages/kilo-vscode/package.json`:
- `displayName`: `"Kilo Code: ..."` → `"Blitx: ..."`
- `description`: Update all references
- `publisher`: `"kilocode"` → `"blitxcode"`
- `keywords`: Replace `kilo`/`kilocode` with `blitx`/`blitxcode`
- Command IDs: `kilo-code.new.*` → `blitx-code.new.*`
- View IDs: Update to `blitx-code.*`

### 3g. VS Code extension icons
- Icon font file references: `kilo-icon-font.woff2` → `blitx-icon-font.woff2`
- Logo references: `logo-outline-black.png` etc.

### 3h. i18n strings
In `packages/kilo-vscode/webview-ui/src/i18n/*.ts` (all language files):
- Replace `"Kilo Code"` → `"Blitx"` in all translation strings
- Replace `aboutKiloCode` → `aboutBlitx` keys
- Replace `kilocode` → `blitxcode` in string keys where appropriate

In `translations/README.*.md`:
- Replace all `"Kilo Code"` → `"Blitx"` references
- Replace `kilo.ai` URLs

### 3i. Storage paths
In `packages/opencode/src/kilocode/paths.ts`:
- Update `globalDirs()` to return `.blitxcode` and `.blitx`
- Update VS Code global storage path

In storage initialization code:
- `~/.local/share/kilo/storage/` → `~/.local/share/blitx/storage/`

### 3j. Package imports
All `@blitxcode/*` imports across the entire monorepo → `@blitxcode/*`:
- This affects every package that imports from `@blitxcode/cli`, `@blitxcode/plugin`, `@blitxcode/sdk`, etc.

### 3k. Repository references
- `package.json` repository URL: `github.com/Kilo-Org/kilocode` → update
- GitHub Actions / CI references
- `.github/` workflow files

### 3l. Documentation
- `README.md`: Replace all Kilo Code references with Blitx
- `AGENTS.md`: Update product references
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`
- `packages/kilo-vscode/AGENTS.md`

### 3m. Workspace files
- `kilocode-2.code-workspace` → rename to `blitx-2.code-workspace`

---

## Phase 4: Cleanup

### 4a. Remove leftover claw references
Search for remaining `claw`, `kiloclaw`, `KiloClaw` strings and remove

### 4b. Remove leftover gateway references
Search for remaining `kilo-gateway`, `KILO_API_BASE`, `api.kilo.ai` strings

### 4c. Remove kilocode_change markers from removed code
Any markers in deleted files are automatically cleaned up. Check remaining markers reference valid code.

### 4d. Update turbo.json and build config
Ensure build pipeline references are updated for renamed packages

### 4e. Update bun.lock
Run `bun install` to regenerate lockfile after package renames

---

## Validation

1. `bun run typecheck` from root — must pass
2. `bun test` from `packages/opencode/` — must pass
3. `bun run lint` from root — must pass
4. Grep for `kilo` (case-insensitive) in source files — remaining references should only be in:
   - Git history / changelogs
   - Third-party package names in node_modules
   - Upstream OpenCode files that haven't been touched (if any remain)
5. `bun run compile` from `packages/kilo-vscode/` — must pass

---

## Risks
- **Breaking change**: All users lose config/data stored under `.kilo/` paths unless migration script provided
- **Provider loss**: The `kilo` provider with free-tier models disappears; users must supply API keys
- **Scope creep**: The rebrand touches 800+ files; some may be missed
- **CI/CD**: GitHub Actions, marketplace listings, and npm publishing need updating
