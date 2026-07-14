# Provider Setup

Legion CLI supports 500+ AI models across multiple providers.

## Supported Providers

| Provider | Models | Authentication |
|---|---|---|
| Anthropic | Claude 3.5, Claude 3 | API Key |
| OpenAI | GPT-4, GPT-4o, o1 | API Key |
| Google | Gemini 1.5, Gemini 2 | API Key |
| Amazon | Bedrock (Claude, Llama) | AWS Credentials |
| Azure | OpenAI Service | API Key |
| Cohere | Command R+ | API Key |
| Mistral | Mistral Large | API Key |
| Groq | Llama 3, Mixtral | API Key |
| Together | Various open models | API Key |
| OpenRouter | Multiple providers | API Key |

## Configuration

### API Keys

Set API keys in `legion.json` or environment variables:

```json
{
  "providers": {
    "anthropic": {
      "apiKey": "env:ANTHROPIC_API_KEY"
    },
    "openai": {
      "apiKey": "env:OPENAI_API_KEY"
    }
  }
}
```

Or use environment variables:

```bash
export ANTHROPIC_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
```

### Model Selection

```json
{
  "model": "anthropic/claude-sonnet-4",
  "small_model": "anthropic/claude-haiku-4"
}
```

## Provider-Specific Setup

### Anthropic

```bash
# Set API key
export ANTHROPIC_API_KEY="sk-ant-..."

# Use Claude
legion run "implement feature" --model anthropic/claude-sonnet-4
```

### OpenAI

```bash
# Set API key
export OPENAI_API_KEY="sk-..."

# Use GPT-4
legion run "implement feature" --model openai/gpt-4o
```

### Google Gemini

```bash
# Set API key
export GOOGLE_API_KEY="AIza..."

# Use Gemini
legion run "implement feature" --model google/gemini-1.5-pro
```

### Amazon Bedrock

```bash
# Configure AWS credentials
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"

# Use Bedrock
legion run "implement feature" --model bedrock/anthropic.claude-3-sonnet
```

### OpenRouter

```bash
# Set API key
export OPENROUTER_API_KEY="sk-or-..."

# Use any model
legion run "implement feature" --model openrouter/anthropic/claude-3-sonnet
```

## Model Selection

### List Available Models
```bash
# List all models
legion models list

# List by provider
legion models list --provider anthropic

# Search models
legion models search "claude"
```

### Model Capabilities

| Capability | Description |
|---|---|
| `vision` | Supports image input |
| `tools` | Supports tool use |
| `streaming` | Supports streaming |
| `json` | Supports JSON mode |

### Model Tiers

| Tier | Use Case | Examples |
|---|---|---|
| Flagship | Complex tasks, coding | Claude 3.5, GPT-4o |
| Fast | Simple tasks, titles | Haiku, GPT-4o-mini |
| Reasoning | Math, logic | o1, Claude 3 Opus |

## Fallback Configuration

Configure fallback models:

```json
{
  "model": "anthropic/claude-sonnet-4",
  "fallback": {
    "model": "openai/gpt-4o",
    "onError": true,
    "onRateLimit": true
  }
}
```

## Rate Limiting

Legion handles rate limits automatically:

```json
{
  "providers": {
    "anthropic": {
      "rateLimit": {
        "requests": 100,
        "tokens": 100000,
        "window": 60000
      }
    }
  }
}
```

## Cost Management

Track and limit costs:

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

## Custom Providers

Add OpenAI-compatible providers:

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

## Troubleshooting

### API Key Issues
```bash
# Verify API key
legion config test --provider anthropic

# Check authentication
legion auth status
```

### Model Not Found
```bash
# List available models
legion models list --provider anthropic

# Check model ID
legion models search "claude-3"
```

### Rate Limiting
```bash
# Check current usage
legion usage show

# Reset rate limits
legion usage reset
```
