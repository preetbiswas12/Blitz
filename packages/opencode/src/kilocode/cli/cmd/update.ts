import type { Argv } from "yargs"
import { cmd } from "@/cli/cmd/cmd"
import { UI } from "@/cli/ui"
import { Installation } from "@/installation"
import { InstallationVersion } from "@opencode-ai/core/installation/version"
import * as prompts from "@clack/prompts"
import semver from "semver"

export const UpdateCommand = cmd({
  command: "update",
  describe: "check for a new Legion version and update if available",
  builder: (yargs: Argv) => {
    return yargs.option("yes", {
      alias: "y",
      describe: "skip confirmation prompt and update automatically",
      type: "boolean",
      default: false,
    })
  },
  handler: async (args) => {
    UI.empty()
    UI.println(UI.logo("  "))
    UI.empty()
    prompts.intro("Update Legion")

    const spinner = prompts.spinner()
    spinner.start("Checking for updates...")

    const method = await Installation.method()
    if (method === "unknown") {
      spinner.stop("Could not determine installation method", 1)
      prompts.log.error(`Legion is installed to ${process.execPath} and may be managed by a package manager`)
      prompts.outro("Done")
      return
    }

    const latest = await Installation.latest(method).catch(() => {
      spinner.stop("Failed to check for updates", 1)
      prompts.log.error("Could not reach the version registry. Check your network connection.")
      prompts.outro("Done")
      return null
    })

    if (!latest) return

    spinner.stop()

    if (semver.valid(latest) && semver.valid(InstallationVersion) && semver.eq(latest, InstallationVersion)) {
      prompts.log.info(`Legion v${InstallationVersion} is up to date`)
      prompts.outro("Done")
      return
    }

    if (semver.valid(latest) && semver.valid(InstallationVersion) && semver.gt(latest, InstallationVersion)) {
      prompts.log.info(`A new version is available: v${latest}`)
      prompts.log.info(`You are currently on v${InstallationVersion}`)
    } else if (semver.valid(latest) && semver.valid(InstallationVersion) && semver.lt(latest, InstallationVersion)) {
      prompts.log.info(`You are on a newer version v${InstallationVersion} (latest is v${latest})`)
    } else {
      prompts.log.info(`Latest: v${latest}`)
      prompts.log.info(`Installed: v${InstallationVersion}`)
    }

    if (!args.yes) {
      const proceed = await prompts.confirm({
        message: `Update Legion to v${latest}?`,
        initialValue: true,
      })
      if (proceed !== true) {
        prompts.outro("Update skipped")
        return
      }
    }

    spinner.start(`Updating to v${latest}...`)
    const err = await Installation.upgrade(method, latest).catch((err) => err)
    if (err) {
      spinner.stop("Update failed", 1)
      if (err instanceof Installation.UpgradeFailedError) {
        prompts.log.error(err.stderr)
      } else if (err instanceof Error) {
        prompts.log.error(err.message)
      }
      prompts.outro("Done")
      return
    }
    spinner.stop(`Updated to v${latest}`)
    prompts.outro(`Restart Legion to complete the update.`)
  },
})
