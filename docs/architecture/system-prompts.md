# System Prompts

Legion CLI assembles system prompts from multiple sources to provide comprehensive context to the AI model.

## Prompt Assembly Order

The system prompt is built in `src/session/system.ts` and `src/session/llm/request.ts`:

```
┌─────────────────────────────────────┐
│ 1. Soul (identity & personality)    │  src/kilocode/soul.txt
├─────────────────────────────────────┤
│ 2. Brain (behavioral rules)         │  src/kilocode/brain.txt
├─────────────────────────────────────┤
│ 3. Provider prompt                  │  src/session/prompt/*.txt
├─────────────────────────────────────┤
│ 4. Memory (LEGION.md + session)     │  src/kilocode/memory/
├─────────────────────────────────────┤
│ 5. Environment (context info)       │  src/kilocode/system-prompt.ts
├─────────────────────────────────────┤
│ 6. Skills (available skills)        │  src/skill/
├─────────────────────────────────────┤
│ 7. ELC Rules (language-specific)    │  src/kilocode/elc/rules.ts
├─────────────────────────────────────┤
│ 8. Context Rules (lazy senior dev)  │  src/kilocode/context/rules.ts
├─────────────────────────────────────┤
│ 9. User/system instructions         │  From config and user input
└─────────────────────────────────────┘
```

## Prompt Sources

### Soul (`src/kilocode/soul.txt`)
Core identity and personality. Defines who the AI is and its fundamental behavior.

### Brain (`src/kilocode/brain.txt`)
Behavioral rules and safety guidelines. Controls how the AI operates, what it can/cannot do, and safety constraints.

### Provider Prompts (`src/session/prompt/*.txt`)
Model-specific prompts optimized for different providers:

| File | Target |
|---|---|
| `anthropic.txt` | Anthropic Claude models |
| `gpt.txt` | OpenAI GPT models |
| `gemini.txt` | Google Gemini models |
| `codex.txt` | Codex models |
| `beast.txt` | High-capability models |
| `ling.txt` | Ling models |
| `kimi.txt` | Kimi models |
| `kilocode-gpt-5.5.txt` | GPT-5.5 specific |
| `copilot-gpt-5.txt` | Copilot GPT-5 |
| `trinity.txt` | Trinity models |
| `default.txt` | Fallback default |

### Memory (`src/kilocode/memory/`)
Project-specific context loaded from:
- `LEGION.md` in project root
- `~/.legion/LEGION.md` (global)
- Session memory entries from `~/.legion/legion-memory.json`

### Environment (`src/kilocode/system-prompt.ts`)
Runtime context injected automatically:
- Model information
- Platform details
- Git status
- Current date
- Project config paths

### ELC Rules (`src/kilocode/elc/rules.ts`)
Language-specific coding rules from Everything Legion Code:
- Common rules (always loaded)
- Language-specific rules (loaded based on file extensions)

### Context Rules (`src/kilocode/context/rules.ts`)
Lazy senior dev mode rules for efficient coding patterns.

## Prompt Types

### Soul Prompt
```
You are Legion, a highly skilled software engineer...
```

### Brain Prompt
Contains behavioral rules, safety guidelines, tool usage policies, and coding conventions.

### Provider Prompt
Model-specific instructions optimized for each AI provider's strengths and limitations.

### Memory Prompt
```
# Project Memory
The following memory has been loaded from LEGION.md and session memory.
Use this context to inform your responses about project conventions...

# LEGION.md content
...
```

## Customization

### Project-Level
Create `LEGION.md` in project root:
```markdown
# Project Conventions
- Use TypeScript strict mode
- Follow Airbnb style guide
- All functions must have JSDoc comments
```

### Global-Level
Create `~/.legion/LEGION.md`:
```markdown
# Global Preferences
- Prefer functional programming
- Use async/await over callbacks
- Always handle errors explicitly
```

### Provider-Specific
The system automatically selects the appropriate provider prompt based on the model being used.
