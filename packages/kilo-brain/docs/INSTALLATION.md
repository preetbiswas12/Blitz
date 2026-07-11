# Installation Guide

This guide will help you install and set up the Claude Code Integration plugin for Obsidian.

## Prerequisites

### 1. Claude Code CLI

Before using this plugin, you must have Claude Code CLI installed:

#### Install via npm (Recommended)
```bash
npm install -g @anthropic-ai/claude-code
```

#### Verify Installation
```bash
claude --version
```

If you see a version number, Claude Code is installed correctly.

### 2. Anthropic API Key

You need an API key from Anthropic:

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy your API key (keep it secure!)

#### Set Up Your API Key

**Option 1: Environment Variable (Recommended)**

Add to your shell configuration file (`~/.bashrc`, `~/.zshrc`, or equivalent):

```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

Then reload your shell:
```bash
source ~/.bashrc  # or ~/.zshrc
```

**Option 2: Claude Code Configuration**
```bash
claude config set api_key your-api-key-here
```

## Installing the Plugin

### Method 1: From Obsidian Community Plugins (Recommended)

1. Open Obsidian
2. Go to Settings (gear icon)
3. Click on "Community plugins"
4. Click "Browse" button
5. Search for "Claude Code Integration"
6. Click "Install"
7. Once installed, click "Enable"

### Method 2: Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/deivid11/obsidian-claude-code-plugin/releases)
2. The release contains three files:
   - `main.js`
   - `manifest.json`
   - `styles.css`
3. Create a folder in your vault: `.obsidian/plugins/claude-code-integration/`
4. Copy the three files into this folder
5. Restart Obsidian or reload the app
6. Go to Settings → Community plugins
7. Find "Claude Code Integration" and enable it

### Method 3: Building from Source

If you want to build the plugin yourself:

```bash
# Clone the repository
git clone https://github.com/deivid11/obsidian-claude-code-plugin.git
cd obsidian-claude-code-plugin

# Install dependencies
npm install

# Build the plugin
npm run build

# Copy files to your vault
mkdir -p /path/to/your/vault/.obsidian/plugins/claude-code-integration/
cp main.js manifest.json styles.css /path/to/your/vault/.obsidian/plugins/claude-code-integration/
```

## Initial Configuration

After installing the plugin:

1. Open Obsidian Settings
2. Navigate to "Claude Code Integration" in the sidebar
3. Configure the following settings:

### Essential Settings

#### Claude Code Path
- **Default**: `claude`
- **When to change**: If Claude Code is not installed globally or you have a custom installation
- **Example custom paths**:
  - `/usr/local/bin/claude`
  - `/home/username/.nvm/versions/node/v18.0.0/bin/claude`
  - `C:\Program Files\nodejs\claude.cmd` (Windows)

#### Default Model
- **Recommended**: `claude-sonnet-4` (balanced)
- **Options**:
  - `claude-sonnet-4` - Best balance of performance and speed
  - `claude-opus-4` - Most capable, slower, higher cost
  - `claude-haiku-4` - Fastest, lower cost, good for simple tasks

### Security Settings

#### Enable Permissionless Mode
- **Default**: OFF (recommended)
- **When to enable**: If you want Claude to work autonomously without asking for permissions
- ⚠️ **Warning**: Claude will be able to read/write files without asking

#### Allow Vault Access
- **Default**: OFF
- **When to enable**: If you want Claude to access files across your entire vault
- **When disabled**: Claude can only access the current note

### Optional Settings

#### Auto Accept Changes
- **Default**: OFF
- **When to enable**: If you trust Claude and want to skip the preview step
- **Recommended**: Keep OFF until you're comfortable with Claude's behavior

#### Timeout
- **Default**: 120 seconds
- **Set to 0**: No timeout (useful for long operations)
- **Increase**: For complex operations that take longer

#### Custom System Prompt
- Add custom instructions to modify Claude's behavior
- Example: "Always write in a formal tone" or "Prefer bullet points over paragraphs"

## Verifying Installation

To verify everything is working correctly:

1. Open the Claude Code panel (click the icon in the left sidebar)
2. Open any markdown note
3. Enter a simple prompt: "Say hello"
4. Click "Run Claude Code"

If you see Claude's response, everything is working! 🎉

## Troubleshooting Installation

### Issue: "Claude Code path not configured"

**Cause**: The plugin can't find the Claude Code CLI

**Solutions**:
1. Verify Claude Code is installed: `claude --version`
2. Find where Claude is installed: `which claude` (Mac/Linux) or `where claude` (Windows)
3. Set the full path in plugin settings

### Issue: "Failed to spawn Claude Code"

**Cause**: Permission issues or incorrect path

**Solutions**:
1. On Linux/Mac, ensure execute permissions: `chmod +x /path/to/claude`
2. Try using the absolute path instead of just `claude`
3. Check if Claude Code works in terminal: `claude --help`

### Issue: "API key not found"

**Cause**: Anthropic API key is not configured

**Solutions**:
1. Set environment variable: `export ANTHROPIC_API_KEY='your-key'`
2. Or configure via CLI: `claude config set api_key your-key`
3. Restart Obsidian after setting the key

### Issue: Plugin doesn't appear in settings

**Cause**: Plugin files not in correct location

**Solutions**:
1. Check folder structure: `.obsidian/plugins/claude-code-integration/`
2. Verify all three files are present: `main.js`, `manifest.json`, `styles.css`
3. Restart Obsidian
4. Check Settings → Community plugins → Installed plugins

### Issue: "Command not found: claude" (Mac/Linux)

**Cause**: Claude Code CLI not in PATH

**Solutions**:
1. Install globally: `npm install -g @anthropic-ai/claude-code`
2. Or add npm global bin to PATH:
   ```bash
   export PATH="$PATH:$(npm config get prefix)/bin"
   ```
3. Add to `.bashrc` or `.zshrc` to make permanent

### Issue: Windows installation problems

**Solutions**:
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Open PowerShell as Administrator
3. Install Claude Code: `npm install -g @anthropic-ai/claude-code`
4. Find installation path: `npm config get prefix`
5. Set plugin path to: `[prefix]\node_modules\.bin\claude.cmd`

## Platform-Specific Notes

### macOS
- If using Homebrew's node: Claude might be in `/opt/homebrew/bin/claude`
- If using nvm: Path includes node version, e.g., `~/.nvm/versions/node/v18.0.0/bin/claude`

### Linux
- Default npm global location: `~/.npm-global/bin/claude` or `/usr/local/bin/claude`
- Might need to run with sudo: `sudo npm install -g @anthropic-ai/claude-code`

### Windows
- Use forward slashes in paths: `C:/Program Files/nodejs/claude.cmd`
- Or double backslashes: `C:\\Program Files\\nodejs\\claude.cmd`
- Might need to run terminal as Administrator

## Next Steps

Once installation is complete:

1. Read the [User Guide](USER_GUIDE.md) to learn how to use the plugin
2. Check out [Examples](EXAMPLES.md) for common use cases
3. Review [Configuration](CONFIGURATION.md) for advanced settings

## Getting Help

If you're still having issues:

1. Check the [FAQ](FAQ.md)
2. Open an issue on [GitHub](https://github.com/deivid11/obsidian-claude-code-plugin/issues)
3. Ask in the Obsidian Discord server
4. Post in the Obsidian Forum

---

**Note**: This plugin is in active development. If you encounter bugs or have suggestions, please open an issue on GitHub!
