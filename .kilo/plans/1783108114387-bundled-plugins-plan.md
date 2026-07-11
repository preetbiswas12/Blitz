# Plan: Bundle ECC + Obsidian Plugin into Legion CLI

## Context

Legion CLI currently ships with minimal built-in skills (1 skill: `legion-config`). The user wants to bundle popular community plugins — **ECC (Everything Claude Code)** and the **Obsidian Claude Code Plugin** — so users get them out of the box without separate installation.

- **ECC** (github.com/affaan-m/ECC, MIT): 278+ skills, 94+ commands, 67 agents, 21 language rule sets, 20+ hooks. All markdown/JSON/Node.js. Ships as npm `ecc-universal`.
- **Obsidian Plugin** (github.com/deivid11/obsidian-claude-code-plugin, MIT): Obsidian desktop plugin that spawns CLI backends (Claude Code, OpenCode) for AI note editing. TypeScript, runs in Obsidian.

**Decisions made:**
- ECC → ship as built-in defaults (skills, commands, agents, rules bundled into Legion source)
- ECC hooks → port to Legion's native plugin hook system (rewrite from Node.js child processes to Legion Hooks interface)
- Obsidian → fork into `packages/kilo-obsidian/`, add Legion as a backend, maintain in-repo

---

## Phase 1: Bundle ECC Skills as Built-in Defaults

### What
Copy ECC's 278+ `SKILL.md` files into Legion's source tree and register them as built-in skills.

### Files to create/modify

| Action | Path |
|---|---|
| Create dir | `packages/opencode/src/kilocode/skills/ecc/` |
| Copy | ECC `skills/*/SKILL.md` → `packages/opencode/src/kilocode/skills/ecc/*/SKILL.md` |
| Modify | `packages/opencode/src/kilocode/skills/builtin.ts` — add ECC skills to `BUILTIN_SKILLS` array |

### Implementation details

1. Clone ECC repo to temp dir: `git clone https://github.com/affaan-m/ECC.git /tmp/ecc`
2. Copy `skills/` directory contents into `packages/opencode/src/kilocode/skills/ecc/`
3. Modify `builtin.ts` to:
   - Import each ECC skill's SKILL.md content as a string (using Bun's `import.meta.glob` or static imports)
   - Register each as a `BuiltinSkill` with `location: "builtin"` and `source: "ecc"`
   - Gate behind a config flag: `ecc.skills: true` (default true)
4. Ensure the skill tool (`packages/opencode/src/tool/skill.ts`) handles the new `ecc` source prefix

### Config addition
Add to `Config.Info` in `packages/opencode/src/config/config.ts`:
```typescript
ecc?: {
  skills?: boolean    // default: true
  commands?: boolean  // default: true
  agents?: boolean    // default: true
  rules?: boolean     // default: true
  hooks?: boolean     // default: true
}
```

---

## Phase 2: Bundle ECC Commands as Built-in Defaults

### What
Copy ECC's 94+ command markdown files into Legion's command system.

### Files to create/modify

| Action | Path |
|---|---|
| Create dir | `packages/opencode/src/kilocode/commands/ecc/` |
| Copy | ECC `commands/*.md` → `packages/opencode/src/kilocode/commands/ecc/*.md` |
| Modify | `packages/opencode/src/command/index.ts` — load ECC commands from bundled directory |

### Implementation details

1. Copy all 94 ECC command `.md` files into `packages/opencode/src/kilocode/commands/ecc/`
2. Modify the `Command` service's `loadBuiltin` to also scan the `kilocode/commands/ecc/` directory
3. Prefix ECC commands with `ecc:` namespace to avoid collisions (e.g., `/ecc:plan`, `/ecc:code-review`)
4. Gate behind `ecc.commands` config flag

---

## Phase 3: Bundle ECC Agents as Built-in Defaults

### What
Copy ECC's 67 agent markdown files into Legion's agent system.

### Files to create/modify

| Action | Path |
|---|---|
| Create dir | `packages/opencode/src/kilocode/agents/ecc/` |
| Copy | ECC `agents/*.md` → `packages/opencode/src/kilocode/agents/ecc/*.md` |
| Modify | `packages/opencode/src/config/agent.ts` — load ECC agents from bundled directory |

### Implementation details

1. Copy all 67 ECC agent `.md` files into `packages/opencode/src/kilocode/agents/ecc/`
2. Modify agent loading to scan `kilocode/agents/ecc/` as a built-in source
3. Prefix with `ecc:` namespace (e.g., `ecc:code-reviewer`, `ecc:security-reviewer`)
4. Gate behind `ecc.agents` config flag

---

## Phase 4: Bundle ECC Rules as Built-in Instructions

### What
Copy ECC's 21 language rule sets and inject them into the system prompt.

### Files to create/modify

| Action | Path |
|---|---|
| Create dir | `packages/opencode/src/kilocode/rules/ecc/` |
| Copy | ECC `rules/` → `packages/opencode/src/kilocode/rules/ecc/` |
| Modify | `packages/opencode/src/session/system.ts` — add `eccRules()` method |
| Modify | `packages/opencode/src/session/llm/request.ts` — inject ECC rules into system prompt |

### Implementation details

1. Copy ECC's `rules/` directory (common + 21 language dirs) into `packages/opencode/src/kilocode/rules/ecc/`
2. Add `SystemPrompt.eccRules(model)` method that:
   - Always includes `rules/common/` (8 universal principle files)
   - Detects project language from file extensions in CWD
   - Includes relevant language-specific rules (e.g., `rules/typescript/` for .ts files)
   - Returns concatenated markdown content
3. Inject into the system prompt array in `request.ts` after `brain()` and before agent prompt
4. Gate behind `ecc.rules` config flag
5. Mark with `kilocode_change` markers since this modifies shared `request.ts`

---

## Phase 5: Port ECC Hooks to Legion Plugin System

### What
Rewrite ECC's 20+ Node.js hook scripts as native Legion hooks using the `Hooks` interface from `@legion/plugin`.

### ECC hooks to port (by category)

| ECC Hook | Legion Hook Interface | Purpose |
|---|---|---|
| `memory-persistence` (SessionStart/PreCompact/SessionEnd) | `event` hook | Save/load session context across restarts |
| `quality-gate` (PostToolUse) | `tool.execute.after` | Run quality checks after tool execution |
| `continuous-learning` (PreToolUse/PostToolUse) | `tool.execute.before` + `tool.execute.after` | Extract patterns from sessions |
| `cost-tracker` (Stop) | `chat.params` | Track token usage and costs |
| `design-quality-check` (PostToolUse) | `tool.execute.after` | Check design quality after edits |
| `console-warn` (PostToolUse) | `tool.execute.after` | Warn on console.log left in code |
| `format-typecheck` (Stop) | `event` | Auto-format and typecheck on stop |
| `config-protection` (PreToolUse) | `tool.execute.before` | Protect config files from accidental edits |
| `session-activity-tracker` (PostToolUse) | `event` | Track session activity metrics |
| `governance-capture` (Pre/Post) | `tool.execute.before` + `tool.execute.after` | Capture governance events |

### Files to create/modify

| Action | Path |
|---|---|
| Create | `packages/opencode/src/kilocode/plugins/ecc-hooks.ts` — main ECC hooks plugin |
| Create | `packages/opencode/src/kilocode/plugins/ecc-hooks/` — individual hook modules |
| Modify | `packages/opencode/src/kilocode/config/default-plugins.ts` — register ECC hooks plugin |
| Modify | `packages/opencode/src/plugin/index.ts` — add ECC hooks to built-in plugins |

### Implementation details

1. Create `ecc-hooks.ts` as a Legion `Plugin` function
2. Port each hook category to the appropriate Legion hook interface:
   - `tool.execute.before` for pre-tool hooks (config protection, governance)
   - `tool.execute.after` for post-tool hooks (quality gate, learning, console warn)
   - `event` for lifecycle hooks (memory persistence, session tracking)
   - `chat.params` for cost tracking
3. Register in `default-plugins.ts` as a built-in plugin
4. Gate behind `ecc.hooks` config flag
5. Use `kilocode_change` markers for all modifications to shared files

---

## Phase 6: Fork Obsidian Plugin with Legion Backend

### What
Fork `deivid11/obsidian-claude-code-plugin` into `packages/kilo-obsidian/`, add a Legion backend adapter, and build as an Obsidian plugin.

### Files to create

| Action | Path |
|---|---|
| Create dir | `packages/kilo-obsidian/` |
| Copy | Entire `obsidian-claude-code-plugin` source → `packages/kilo-obsidian/` |
| Create | `packages/kilo-obsidian/src/core/backends/legion-backend.ts` |
| Modify | `packages/kilo-obsidian/src/core/backends/types.ts` — add `'legion'` to BackendType |
| Modify | `packages/kilo-obsidian/src/core/backends/index.ts` — add Legion case to factory |
| Modify | `packages/kilo-obsidian/src/core/settings.ts` — add Legion settings |
| Modify | `packages/kilo-obsidian/manifest.json` — rename to "Legion Code Integration" |
| Modify | `packages/kilo-obsidian/package.json` — rename, update metadata |
| Create | `packages/kilo-obsidian/README.md` — Legion-specific docs |

### LegionBackend implementation

```typescript
// Minimal — Legion is an OpenCode fork, so reuse OpenCode event parsing
export class LegionBackend implements CLIBackend {
  readonly name = 'legion' as const;
  
  buildArgs(config: BackendConfig): string[] {
    const args = ['run', '--format', 'json'];
    if (config.sessionId) args.push('--session', config.sessionId);
    if (config.model) args.push('-m', config.model);
    return args;
  }
  
  // parseEvent: identical to OpenCodeBackend (same JSON wire format)
  // getExecutablePath: detect `legion` binary at standard paths
  // requiresStdinInput: true (plain text, same as OpenCode)
}
```

### Build
- Add to workspace: `"packages/kilo-obsidian"` in root `package.json` workspaces
- Add build script using esbuild (same as original)
- Obsidian plugin output: `main.js`, `manifest.json`, `styles.css`

---

## Phase 7: Config Schema + Documentation

### Files to modify

| Action | Path |
|---|---|
| Modify | `packages/opencode/src/config/config.ts` — add `ecc` config block |
| Modify | `packages/opencode/src/config/config.ts` — add JSON Schema for `ecc` |
| Create | `packages/opencode/src/kilocode/skills/ecc-overview.md` — meta-skill explaining ECC |

### Config schema

```jsonc
{
  "ecc": {
    "skills": true,      // Ship ECC's 278+ skills as built-in
    "commands": true,     // Ship ECC's 94+ commands
    "agents": true,       // Ship ECC's 67 agents
    "rules": true,        // Ship ECC's 21 language rule sets
    "hooks": true         // Enable ECC hooks (memory, quality, learning)
  }
}
```

All default to `true`. Users can disable individual categories:
```jsonc
{
  "ecc": {
    "hooks": false       // Disable ECC hooks if they cause issues
  }
}
```

---

## Validation Plan

1. **Typecheck**: `bun turbo typecheck` from root
2. **Build**: `bun run dev` from root — verify ECC skills appear in skill dialog
3. **Skill count**: `bun run debug skill` — verify 278+ ECC skills are registered
4. **Command count**: Check `/ecc:` commands appear in TUI slash command list
5. **Agent count**: Check `ecc:` agents appear in agent picker
6. **Rules injection**: Start a session in a TypeScript project, verify TypeScript rules appear in system prompt
7. **Hooks**: Trigger a tool execution, verify ECC quality gate hook fires
8. **Obsidian**: `cd packages/kilo-obsidian && npm run build` — verify plugin builds
9. **Config disable**: Set `ecc.hooks: false`, verify hooks don't fire
10. **Binary size**: Check CLI build artifact size increase (expect ~2-5MB from markdown content)

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Binary size bloat from 278+ markdown files | Use dynamic imports / lazy loading; markdown compresses well (~500KB total) |
| ECC skill/command name collisions with Legion built-ins | Namespace all ECC content with `ecc:` prefix |
| ECC hooks conflict with Legion's existing behavior | Gate behind config flag; defaults ON but easily disabled |
| ECC's Node.js hooks assume Claude Code tool names | Map tool names during port (e.g., `Bash` → `shell`, `Write` → `write`) |
| Obsidian plugin binary detection differs per platform | Reuse original plugin's platform detection logic |
| MIT license compatibility | Both ECC and Obsidian plugin are MIT — compatible with Legion |

---

## Execution Order

1. Phase 1 (Skills) — highest user-visible impact, easiest to implement
2. Phase 2 (Commands) — same pattern as skills
3. Phase 3 (Agents) — same pattern as skills
4. Phase 4 (Rules) — requires system prompt modification
5. Phase 5 (Hooks) — most complex, requires hook-by-hook porting
6. Phase 6 (Obsidian) — independent, can run in parallel
7. Phase 7 (Config + Docs) — final polish
