# Plan: Bundle Ponytail into Legion CLI

## What is Ponytail?

Ponytail (80k+ stars, MIT license) forces AI agents to write the minimum code that works — a "lazy senior dev" ruleset with a 7-rung ladder: YAGNI → reuse codebase → stdlib → native platform → installed deps → one line → minimum. Includes 6 skills, 6 commands, ruleset, and intensity system (lite/full/ultra/off).

## What to Bundle

| Asset | Count | Source Path |
|---|---|---|
| Skills | 6 | `.tmp-ponytail/skills/*/SKILL.md` |
| Commands | 6 | `.tmp-ponytail/commands/*.toml` |
| Ruleset | 1 | `.tmp-ponytail/AGENTS.md` (always injected) |

## What NOT to Bundle

Ponytail's lifecycle hooks (`ponytail-activate.js`, `ponytail-mode-tracker.js`, `ponytail-subagent.js`) are Claude Code/Codex-specific. Their equivalent behavior is handled natively in Legion:

| Ponytail Hook | Legion Equivalent |
|---|---|
| SessionStart → inject ruleset | `SystemPrompt.ponytailRules()` in `prompt.ts` |
| UserPromptSubmit → track mode | `/ponytail` command sends prompt to agent |
| SubagentStart → inject ruleset | Legion inherits system prompt for subagents |

## Implementation Steps

### Step 1: `.gitignore` — add temp clone dirs

Add to root `.gitignore`:
```
.tmp-ecc
.tmp-ponytail
```

(Note: `.tmp-ecc` is missing too — add both.)

### Step 2: Code generation script

Create `packages/opencode/script/generate-ponytail.ts` following `generate-ecc.ts` pattern.

**Clone**: `git clone --depth 1 https://github.com/DietrichGebert/ponytail.git .tmp-ponytail`

**Collect functions**:
- `collectSkills()` — reads `.tmp-ponytail/skills/*/SKILL.md`, parses YAML frontmatter (`name`, `description`)
- `collectCommands()` — reads `.tmp-ponytail/commands/*.toml`, parses TOML (`description`, `prompt` fields). Name = filename without `.toml`.
- `collectRules()` — reads `.tmp-ponytail/AGENTS.md` as single string

**Generate 3 files** in `src/kilocode/ponytail/`:

1. `skills.ts` — `PONYTAIL_SKILLS: PonytailSkill[]` (6 entries)
2. `commands.ts` — `PONYTAIL_COMMANDS: PonytailCommand[]` (6 entries, `content` = TOML `prompt` field)
3. `rules.ts` — `PONYTAIL_RULE: string` (the AGENTS.md content)

TOML parsing: Use a simple regex parser (no external deps needed for 6 two-field TOML files):
```ts
function parseToml(text: string): { description: string; prompt: string } {
  const desc = text.match(/^description\s*=\s*"(.+)"$/m)?.[1] ?? ""
  const prompt = text.match(/^prompt\s*=\s*"([\s\S]*?)"$/m)?.[1] ?? ""
  return { description: desc, prompt }
}
```

### Step 3: `src/kilocode/ponytail/index.ts`

Create command helper (same pattern as `ecc/index.ts`):

```ts
import { PONYTAIL_COMMANDS } from "../ponytail/commands"
import type { Info as CommandInfo } from "@/command"

export function ponytailCommands(opts?: { enabled?: boolean }): Record<string, CommandInfo> {
  if (opts?.enabled === false) return {}
  const result: Record<string, CommandInfo> = {}
  for (const cmd of PONYTAIL_COMMANDS) {
    result[cmd.name] = {
      name: cmd.name,
      description: cmd.description,
      source: "command",
      template: cmd.content,
      hints: cmd.content.includes("$ARGUMENTS") ? ["$ARGUMENTS"] : [],
    }
  }
  return result
}
```

### Step 4: Register skills in `builtin.ts`

In `src/kilocode/skills/builtin.ts`:
- Import `PONYTAIL_SKILLS` from `../ponytail/skills`
- Spread into `BUILTIN_SKILLS` after ECC skills

```ts
export const BUILTIN_SKILLS: BuiltinSkill[] = [
  ...LEGION_SKILLS,
  ...ECC_SKILLS.map((s) => ({ name: s.name, description: s.description, content: s.content })),
  ...PONYTAIL_SKILLS.map((s) => ({ name: s.name, description: s.description, content: s.content })),
]
```

### Step 5: Register commands in `command/index.ts`

In `src/command/index.ts`:
- Import `ponytailCommands` from `@/kilocode/ponytail`
- Register after ECC commands block:

```ts
// kilocode_change start - Ponytail bundled commands
for (const [name, command] of Object.entries(ponytailCommands({ enabled: cfg.ponytail?.commands }))) {
  if (!commands[name]) commands[name] = command
}
// kilocode_change end
```

No prefix needed — ponytail commands (`ponytail`, `ponytail-audit`, etc.) are unique and don't conflict with existing commands.

### Step 6: Inject ruleset into system prompt

In `src/session/system.ts`:
- Import `PONYTAIL_RULE` from `../ponytail/rules`
- Add function:

```ts
export function ponytailRules(opts?: { enabled?: boolean }) {
  if (opts?.enabled === false) return ""
  if (!PONYTAIL_RULE) return ""
  return [
    "# Ponytail — Lazy Senior Dev Mode",
    "The following ruleset from Ponytail applies to this project:",
    "",
    PONYTAIL_RULE.trim(),
  ].join("\n")
}
```

In `src/session/prompt.ts` (after ECC rules injection block, ~line 1734):
- Add ponytail rules injection:

```ts
// kilocode_change start - inject Ponytail ruleset
if (cfg.ponytail?.rules !== false) {
  const ponytailContent = SystemPrompt.ponytailRules({ enabled: cfg.ponytail?.rules })
  if (ponytailContent) system.push(ponytailContent)
}
// kilocode_change end
```

### Step 7: Config schema

In `src/config/config.ts` (after `ecc` block, ~line 295):

```ts
ponytail: Schema.optional(
  Schema.Struct({
    skills: Schema.optional(Schema.Boolean).annotate({
      description: "Enable Ponytail built-in skills (default: true)",
    }),
    commands: Schema.optional(Schema.Boolean).annotate({
      description: "Enable Ponytail built-in slash commands (default: true)",
    }),
    rules: Schema.optional(Schema.Boolean).annotate({
      description: "Enable Ponytail lazy senior dev ruleset in system prompt (default: true)",
    }),
  }),
).annotate({
  description: "Ponytail (lazy senior dev mode) integration settings. Controls bundled skills, commands, and ruleset.",
}),
```

### Step 8: Add script to `package.json`

In `packages/opencode/package.json`, add to `scripts`:
```json
"generate:ponytail": "bun run script/generate-ponytail.ts"
```

## File Changes Summary

| File | Action | Description |
|---|---|---|
| `.gitignore` | EDIT | Add `.tmp-ecc` and `.tmp-ponytail` |
| `packages/opencode/script/generate-ponytail.ts` | NEW | Code generator |
| `packages/opencode/src/kilocode/ponytail/skills.ts` | NEW (generated) | 6 skills |
| `packages/opencode/src/kilocode/ponytail/commands.ts` | NEW (generated) | 6 commands |
| `packages/opencode/src/kilocode/ponytail/rules.ts` | NEW (generated) | Ruleset string |
| `packages/opencode/src/kilocode/ponytail/index.ts` | NEW | Command helper |
| `packages/opencode/src/kilocode/skills/builtin.ts` | EDIT | Add PONYTAIL_SKILLS spread |
| `packages/opencode/src/command/index.ts` | EDIT | Register ponytail commands |
| `packages/opencode/src/session/system.ts` | EDIT | Add ponytailRules() |
| `packages/opencode/src/session/prompt.ts` | EDIT | Inject ponytail rules |
| `packages/opencode/src/config/config.ts` | EDIT | Add ponytail config block |
| `packages/opencode/package.json` | EDIT | Add generate:ponytail script |

## Mode Switching

Ponytail's intensity levels (lite/full/ultra/off) work via prompt instruction — no programmatic state needed:

1. Default mode: `full` (ladder enforced)
2. `/ponytail [level]` command sends a prompt telling the agent which intensity to use
3. Agent remembers the mode for the session (LLM context)
4. Ruleset always injected; intensity affects how strictly the agent follows it

This matches how ponytail works in Claude Code/Codex — the mode is a behavioral instruction, not a runtime flag.

## Validation

1. `bun run script/generate-ponytail.ts` from `packages/opencode/`
2. Verify generated files: `ls src/kilocode/ponytail/` → 4 files
3. `bun run typecheck` from `packages/opencode/`
4. Manual: launch `bun run dev`, type `/ponytail` → should register as command
5. Manual: type `/ponytail-review` → should trigger review skill

## Risks

- **TOML parser**: Simple regex approach works for ponytail's 6 two-field files. No external dep needed.
- **Binary size**: Ponytail skills are ~350 lines total. Negligible impact.
- **Ruleset always-on**: By default, the lazy senior dev ruleset is injected every turn. Users who don't want it can set `ponytail.rules: false` in `legion.json`.
- **License**: MIT confirmed. Compatible with Legion.
