# Model Selection

Legion CLI supports 500+ AI models with intelligent selection based on task requirements.

## Model Categories

### Flagship Models
Best for complex coding tasks, architecture, and detailed analysis:

| Model | Provider | Strengths |
|---|---|---|
| Claude 3.5 Sonnet | Anthropic | Coding, analysis, long context |
| GPT-4o | OpenAI | General purpose, fast |
| Gemini 1.5 Pro | Google | Long context, multimodal |
| Claude 3 Opus | Anthropic | Reasoning, complex tasks |

### Fast Models
Best for simple tasks, titles, and quick operations:

| Model | Provider | Strengths |
|---|---|---|
| Claude 3.5 Haiku | Anthropic | Fast, cheap |
| GPT-4o-mini | OpenAI | Fast, cost-effective |
| Gemini 1.5 Flash | Google | Ultra-fast |

### Reasoning Models
Best for math, logic, and complex reasoning:

| Model | Provider | Strengths |
|---|---|---|
| o1 | OpenAI | Step-by-step reasoning |
| Claude 3 Opus | Anthropic | Deep analysis |

## Selection Criteria

### By Task Type

| Task | Recommended Model |
|---|---|
| Code generation | Claude 3.5 Sonnet, GPT-4o |
| Code review | Claude 3.5 Sonnet |
| Bug fixing | Claude 3.5 Sonnet, GPT-4o |
| Refactoring | Claude 3.5 Sonnet |
| Documentation | Claude 3.5 Haiku, GPT-4o-mini |
| Testing | Claude 3.5 Haiku |
| Architecture | Claude 3 Opus, o1 |
| Quick edits | Claude 3.5 Haiku |

### By Context Size

| Context | Models |
|---|---|
| Small (< 10K tokens) | Any model |
| Medium (10K-100K) | Claude 3.5, GPT-4o |
| Large (100K-200K) | Claude 3.5, Gemini 1.5 |
| Huge (200K+) | Gemini 1.5 (1M context) |

### By Cost

| Cost | Models |
|---|---|
| Low | Haiku, GPT-4o-mini, Flash |
| Medium | Claude 3.5 Sonnet, GPT-4o |
| High | Claude 3 Opus, o1 |

## Configuration

### Primary Model
```json
{
  "model": "anthropic/claude-sonnet-4"
}
```

### Small Model
For simple tasks like title generation:
```json
{
  "small_model": "anthropic/claude-haiku-4"
}
```

### Subagent Model
For background tasks:
```json
{
  "subagent_model": "anthropic/claude-sonnet-4"
}
```

## Model Switching

### Runtime Switching
```bash
# Use specific model
legion run "implement feature" --model openai/gpt-4o

# Use small model for quick task
legion run "generate title" --model anthropic/claude-haiku-4
```

### Automatic Selection
Legion automatically selects models based on:
- Task complexity
- Required capabilities
- Cost constraints
- Rate limits

## Model Capabilities

### Vision
Models that support image input:
- Claude 3.5 Sonnet
- GPT-4o
- Gemini 1.5 Pro

### Tool Use
Models that support function calling:
- Claude 3.5 Sonnet
- GPT-4o
- Gemini 1.5 Pro

### Streaming
All modern models support streaming.

### JSON Mode
Models with reliable JSON output:
- GPT-4o
- Claude 3.5 Sonnet
- Gemini 1.5 Pro

## Custom Models

### OpenAI-Compatible
```json
{
  "providers": {
    "custom": {
      "type": "openai",
      "baseUrl": "https://your-api.com/v1",
      "apiKey": "env:CUSTOM_API_KEY",
      "models": ["model-1", "model-2"]
    }
  }
}
```

### Model Registry
```json
{
  "models": {
    "custom-model": {
      "provider": "custom",
      "id": "model-1",
      "name": "Custom Model",
      "capabilities": ["tools", "streaming"],
      "contextWindow": 128000
    }
  }
}
```

## Cost Optimization

### Token Usage
Track token usage:
```bash
legion usage show
legion usage show --model anthropic/claude-sonnet-4
```

### Cost Limits
Set cost limits:
```json
{
  "providers": {
    "anthropic": {
      "costLimit": {
        "daily": 10.00,
        "monthly": 100.00
      }
    }
  }
}
```

### Model Fallbacks
Configure fallbacks for cost optimization:
```json
{
  "model": "anthropic/claude-sonnet-4",
  "fallback": {
    "model": "anthropic/claude-haiku-4",
    "onCostLimit": true
  }
}
```

## Best Practices

1. **Start with Claude 3.5 Sonnet** - Best for most coding tasks
2. **Use Haiku for simple tasks** - Title generation, quick edits
3. **Use Opus for complex reasoning** - Architecture, design
4. **Monitor costs** - Use cost limits and tracking
5. **Set up fallbacks** - Handle rate limits and errors
6. **Test different models** - Find what works for your workflow
