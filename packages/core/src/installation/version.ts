import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

declare global {
  const KILO_VERSION: string
  const KILO_CHANNEL: string
  const KILO_BUILD_KIND: string // kilocode_change
}

function getPackageVersion(): string {
  try {
    // kilocode_change start - read version from package.json for dev mode
    const dir = typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url))
    const pkgPath = resolve(dir, "../../opencode/package.json")
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
    return pkg.version
    // kilocode_change end
  } catch {
    return "local"
  }
}

export const InstallationVersion = typeof KILO_VERSION === "string" ? KILO_VERSION : getPackageVersion()
export const InstallationChannel = typeof KILO_CHANNEL === "string" ? KILO_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
// kilocode_change start - distinguish release builds from source / local builds
export const InstallationBuildKind: "source" | "release" =
  typeof KILO_BUILD_KIND === "string" && KILO_BUILD_KIND === "release" ? "release" : "source"
// kilocode_change end
