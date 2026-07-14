# Multi-Model Support

Legion CLI supports 500+ AI models across multiple providers with intelligent routing and fallback.

## Overview

Multi-model support enables:

- **Task-specific routing** - Use the best model for each task
- **Cost optimization** - Balance quality and cost
- **Reliability** - Fallback when providers are unavailable
- **Specialization** - Leverage model strengths

## Model Routing

### Automatic Routing
Legion automatically selects models based on:

1. **Task complexity** - Simple tasks use faster models
2. **Required capabilities** - Vision, tools, streaming
3. **Context size** - Larger contexts need specific models
4. **Cost constraints** - Stay within budget

### Manual Routing
```bash
# Specify model directly
legion run "implement feature" --model anthropic/claude-sonnet-4

# Use small model
legion run "generate title" --model anthropic/claude-haiku-4
```

## Provider Configuration

### Multiple Providers
```json
{
  "providers": {
    "anthropic": {
      "apiKey": "env:ANTHROPIC_API_KEY"
    },
    "openai": {
      "apiKey": "env:OPENAI_API_KEY"
    },
    "google": {
      "apiKey": "env:GOOGLE_API_KEY"
    }
  }
}
```

### Fallback Chain
```json
{
  "model": "anthropic/claude-sonnet-4",
  "fallback": {
    "chain": [
      "openai/gpt-4o",
      "google/gemini-1.5-pro"
    ],
    "onError": true,
    "onRateLimit": true
  }
}
```

## Model Capabilities

### Capability Matrix

| Capability | Claude 3.5 | GPT-4o | Gemini 1.5 | Llama 3 |
|---|---|---|---|---|
| Vision | ✓ | ✓ | ✓ | ✓ |
| Tools | ✓ | ✓ | ✓ | ✓ |
| Streaming | ✓ | ✓ | ✓ | ✓ |
| JSON Mode | ✓ | ✓ | ✓ | ✗ |
| Context | 200K | 128K | 1M | 128K |

### Capability Detection
```typescript
// Check model capabilities
const model = yield* Provider.getModel("anthropic/claude-sonnet-4")

if (model.capabilities.vision) {
  // Use vision
}

if (model.capabilities.tools) {
  // Use tools
}
```

## Task-Based Routing

### Coding Tasks
```json
{
  "routing": {
    "coding": "anthropic/claude-sonnet-4",
    "review": "anthropic/claude-sonnet-4",
    "refactor": "anthropic/claude-sonnet-4"
  }
}
```

### Simple Tasks
```json
{
  "routing": {
    "title": "anthropic/claude-haiku-4",
    "summary": "anthropic/claude-haiku-4",
    "rename": "anthropic/claude-haiku-4"
  }
}
```

### Complex Tasks
```json
{
  "routing": {
    "architecture": "anthropic/claude-3-opus",
    "reasoning": "openai/o1",
    "analysis": "anthropic/claude-3-opus"
  }
}
```

## Cost Management

### Cost Tracking
```bash
# View usage
legion usage show

# By provider
legion usage show --provider anthropic

# By model
legion usage show --model anthropic/claude-sonnet-4
```

### Cost Limits
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

### Cost Optimization
1. **Use Haiku for simple tasks** - 10x cheaper
2. **Batch operations** - Reduce API calls
3. **Cache results** - Avoid redundant calls
4. **Set limits** - Prevent overspending

## Fallback Strategies

### Error-Based Fallback
```json
{
  "fallback": {
    "onError": true,
    "onTimeout": true,
    "onRateLimit": true
  }
}
```

### Quality-Based Fallback
```json
{
  "fallback": {
    "ifQualityBelow": 0.8,
    "tryNext": true
  }
}
```

### Cost-Based Fallback
```json
{
  "fallback": {
    "ifCostAbove": 0.10,
    "useCheaper": true
  }
}
```

## Custom Providers

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
      "contextWindow": 128000,
      "costPer1kTokens": 0.002
    }
  }
}
```

## Best Practices

1. **Start with Claude 3.5 Sonnet** - Best for coding
2. **Use Haiku for simple tasks** - Save costs
3. **Set up fallbacks** - Ensure reliability
4. **Monitor costs** - Track spending
5. **Test different models** - Find what works
6. **Use capability detection** - Match task to model
7. **Cache results** - Reduce API calls
8. **Batch operations** - Improve efficiency

## Examples

### Multi-Model Workflow
```bash
# 1. Plan with Opus
legion run "design architecture" --model anthropic/claude-3-opus

# 2. Implement with Sonnet
legion run "implement feature" --model anthropic/claude-sonnet-4

# 3. Test with Haiku
legion run "generate tests" --model anthropic/claude-haiku-4

# 4. Review with Sonnet
legion run "review code" --model anthropic/claude-sonnet-4
```

### Cost-Optimized Workflow
```bash
# Use small model for titles
legion run "generate PR title" --model anthropic/claude-haiku-4

# Use large model for complex code
legion run "implement auth" --model anthropic/claude-sonnet-4
```

### Fallback Example
```bash
# If Claude is unavailable, use GPT-4o
# Configured via fallback chain
legion run "implement feature"
# Automatically falls back to GPT-4o if Claude fails
```
