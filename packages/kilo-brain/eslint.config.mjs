import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
	...obsidianmd.configs.recommended,
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: "./tsconfig.json",
			},
			globals: {
				...globals.node,
				...globals.browser,
				NodeJS: "readonly",
			},
		},
		rules: {
			// Add Claude-related brands to the sentence-case rule
			"obsidianmd/ui/sentence-case": ["error", {
				brands: [
					// Default brands (from obsidianmd plugin)
					"iOS", "iPadOS", "macOS", "Windows", "Android", "Linux",
					"Obsidian", "Obsidian Sync", "Obsidian Publish",
					"Google Drive", "Dropbox", "OneDrive", "iCloud Drive",
					"YouTube", "Slack", "Discord", "Telegram", "WhatsApp", "Twitter", "X",
					"Readwise", "Zotero", "Excalidraw", "Mermaid",
					"Markdown", "LaTeX", "JavaScript", "TypeScript", "Node.js",
					"npm", "pnpm", "Yarn", "Git", "GitHub", "GitLab",
					"Notion", "Evernote", "Roam Research", "Logseq", "Anki", "Reddit",
					"VS Code", "Visual Studio Code", "IntelliJ IDEA", "WebStorm", "PyCharm",
					// Claude-specific brands
					"Claude", "Claude Code", "Sonnet", "Opus", "Haiku", "Anthropic"
				],
				ignoreRegex: [
					// Ignore Unix paths (e.g., /usr/local/bin/claude)
					"^/[a-z]",
					// Ignore model identifiers (e.g., claude-sonnet-4-20250514)
					"^claude-[a-z]+-\\d",
					// Ignore placeholder prompts starting with "You are"
					"^You are"
				]
			}]
		}
	},
	{
		ignores: ["node_modules/**", "main.js", "*.config.js", "*.config.mjs"],
	}
);
