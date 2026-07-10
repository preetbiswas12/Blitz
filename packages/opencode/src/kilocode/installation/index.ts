export const Npm = {
  name: "@legion/cli",
  path: "@legion%2fcli",
}

export const Brew = {
  name: "legion",
  tap: "preetbiswas12/tap",
  formula: "preetbiswas12/tap/legion",
  api: "https://formulae.brew.sh/api/formula/legion.json",
}

export const Choco = {
  name: "legion",
  api: "https://community.chocolatey.org/api/v2/Packages?$filter=Id%20eq%20%27legion%27%20and%20IsLatestVersion&$select=Version",
}

export const Scoop = {
  name: "legion",
  manifest: "https://raw.githubusercontent.com/preetbiswas12/scoop-bucket/main/bucket/legion.json",
}

export const Release = {
  api: "https://api.github.com/repos/preetbiswas12/Blitz/releases/latest",
  install: "https://legion.ai/cli/install",
}
