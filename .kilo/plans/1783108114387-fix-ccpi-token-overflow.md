# Fix CCPI Token Context Overflow

## Problem

The lazy-load architecture is fake. `ccpi/index.ts` uses a **static** `import { CCPI_SKILLS } from "./skills"` which forces the JavaScript runtime to eagerly evaluate all 649,548 lines / ~22MB of `skills.ts` at module load time. Every skill content string is fully materialized in memory before any skill is ever accessed.

The `_ccpiMeta` + `loadCcpiContent()` indirection in `skill/index.ts` saves nothing — `CCPI_SKILLS` is already fully in memory from the static import.

## Root Cause

```
skill/index.ts
  └→ builtin.ts
       └→ ccpi/index.ts
            └→ import { CCPI_SKILLS } from "./skills"  // STATIC: 22MB loaded eagerly
```

All ES module `import` statements are static and resolved at module evaluation time. There is no lazy boundary.

## Fix: Dynamic `import()` for CCPI skills

Replace the static import in `ccpi/index.ts` with a dynamic `import()` that defers loading `skills.ts` until a CCPI skill is actually requested.

### File Changes

#### 1. `src/kilocode/ccpi/index.ts`

**Before:**
```ts
import { CCPI_SKILLS } from "./skills"
// ... uses CCPI_SKILLS synchronously
```

**After:**
```ts
let _skills: typeof import("./skills")["CCPI_SKILLS"] | null = null

async function loadSkills() {
  if (!_skills) {
    const mod = await import("./skills")
    _skills = mod.CCPI_SKILLS
  }
  return _skills
}

export async function getCcpiSkillMetas() {
  const skills = await loadSkills()
  return skills.map((s, i) => ({ name: s.name, description: s.description, category: s.category, index: i }))
}

export async function getCcpiSkillContent(name: string): Promise<string | null> {
  const skills = await loadSkills()
  const idx = skills.findIndex(s => s.name === name)
  if (idx === -1) return null
  return skills[idx].content
}
```

#### 2. `src/kilocode/skills/builtin.ts`

Update `loadCcpiContent` to be async, since `getCcpiSkillContent` is now async:
```ts
export async function loadCcpiContent(name: string): Promise<string | null> {
  return getCcpiSkillContent(name)
}
```

Remove `CCPI_BUILTIN_METAS` from module-level (can't call async at module init). Instead, register CCPI skills lazily in `skill/index.ts`.

#### 3. `src/skill/index.ts`

Change the CCPI registration block to be async:

```ts
// kilocode_change start - register CCPI skills lazily
if (ccpiEnabled !== false) {
  const metas = await getCcpiSkillMetas()
  for (const meta of metas) {
    const name = `ccpi-${meta.name}`
    state.skills[name] = {
      name,
      description: meta.description,
      location: BUILTIN_LOCATION,
      content: "",
      _ccpiName: meta.name,
    } as any
  }
}
// kilocode_change end
```

And update `get()`/`require()` to load content async:

```ts
const get = Effect.fn("Skill.get")(function* (name: string) {
  const s = yield* InstanceState.get(state)
  const skill = s.skills[name]
  if (skill && !skill.content && (skill as any)._ccpiName) {
    skill.content = (yield* Effect.promise(() => loadCcpiContent((skill as any)._ccpiName))) || ""
  }
  return skill
})
```

### What This Achieves

- `skills.ts` (22MB) is NOT loaded at startup
- It's only loaded on first access to any CCPI skill via dynamic `import()`
- The `import()` is cached after first load — subsequent accesses are instant
- ELC/Context skills remain static (they're small enough)
- No git changes needed — same files, just different import semantics

### Risk

- Dynamic `import()` in Bun compiled binaries: Bun supports `import()` in compiled binaries. The file is part of the bundle.
- First CCPI skill access has a small async delay (module evaluation). Subsequent accesses are cached.
- The `loadSkills()` promise must be awaited in Effect generators via `Effect.promise()`.

### Validation

1. `bun run typecheck` — must pass
2. Verify `skills.ts` is NOT loaded at startup by checking that the module is not evaluated until first access
3. Test: call `Skill.get("ccpi-bash-script-helper")` and verify content is returned
