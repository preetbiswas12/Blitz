# Releasing Blitx CLI

Blitx CLI uses a fully automated CI pipeline triggered via GitHub Actions `workflow_dispatch`. A single workflow handles version bumping, building all artifacts, publishing to every distribution channel, and updating package registries.

## How to Trigger a Release

1. Go to the [`publish` workflow](https://github.com/preetbiswas12/Blitz/actions/workflows/publish.yml) in GitHub Actions.
2. Click **"Run workflow"**.
3. Select the branch (typically `main`).
4. Fill in the inputs:
   - **`bump`** (choice): `patch`, `minor`, or `major`. Determines how the version number is incremented.
   - **`version`** (string, optional): Override the version explicitly instead of using `bump`. Leave empty to use the bump-based calculation.

   > **⚠️ Do not fill in `version` unless you have a specific reason to.**
   > The default behavior — leaving `version` empty and selecting a `bump` level — is almost always what you want. The automated bump logic computes the correct next version from the current state of the repo. Only use the `version` override for exceptional cases like skipping versions or publishing a pre-release (e.g. `1.5.0-beta.1`).

5. Click **"Run workflow"** to start the release.

## What Happens During a Release

The `publish.yml` workflow runs three jobs sequentially:

### 1. Version (`version`)

- Checks out the repo with full history (`fetch-depth: 0`).
- Runs `script/version.ts` to compute the next version based on the `bump` or `version` input.
- Generates release notes from the commit history since the last release.
- Creates a **draft** GitHub Release with the computed tag (e.g. `v1.2.3`) and release notes.
- Outputs the `version`, `release` (database ID), and `tag` for downstream jobs.

### 2. Build CLI (`build-cli`)

- Runs `packages/opencode/script/build.ts` to compile the Blitx CLI binary.
- Builds native binaries for **all supported platforms and architectures**:
  - Linux: x64, arm64 (glibc and musl), plus baseline (non-AVX2) variants
  - macOS: x64, arm64, plus baseline variants
  - Windows: x64 (plus baseline variant), arm64
- Patches ELF interpreters on Linux binaries for broad compatibility.
- Creates platform archives (`.tar.gz` for Linux, `.zip` for macOS/Windows) and uploads them to the draft GitHub Release.
- Uploads the `dist/` directory as a workflow artifact for subsequent jobs.

### 3. Publish (`publish`)

Downloads all build artifacts and publishes to every distribution channel:

#### Version Commit and Tagging

- Updates the `version` field in all `package.json` files across the monorepo.
- Updates the Zed extension manifest (`extension.toml`) with the new version.
- Rebuilds the TypeScript SDK (`packages/sdk/js`).
- Commits the version bump, tags the commit, and pushes to the repo.
- Promotes the draft GitHub Release to a published release.

#### CLI (`@blitxcode/cli`)

- Publishes platform-specific binary packages to **npm** (e.g. `@blitxcode/cli-linux-x64`, `@blitxcode/cli-darwin-arm64`, etc.).
- Publishes the main `@blitxcode/cli` package to **npm** with optional dependencies on the binary packages.
- Builds and pushes a multi-arch **Docker image** (`ghcr.io/preetbiswas12/blitz`) to GitHub Container Registry (linux/amd64 + linux/arm64).

#### SDK (`@blitxcode/sdk`)

- Builds and publishes the TypeScript SDK to **npm**.

#### Plugin (`@blitxcode/plugin`)

- Builds and publishes the plugin interface package to **npm**.
