<p align="center">
  <a href="../README.md">English</a> | <a href="README.zh.md">简体中文</a> | <a href="README.zht.md">繁體中文</a> | <a href="README.ko.md">한국어</a> | Deutsch | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.da.md">Dansk</a> | <a href="README.ja.md">日本語</a> | <a href="README.pl.md">Polski</a> | <a href="README.ru.md">Русский</a> | <a href="README.bs.md">Bosanski</a> | <a href="README.ar.md">العربية</a> | <a href="README.no.md">Norsk</a> | <a href="README.br.md">Português (Brasil)</a> | <a href="README.th.md">ไทย</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.bn.md">বাংলা</a> | <a href="README.gr.md">Ελληνικά</a> | <a href="README.vi.md">Tiếng Việt</a>
</p>

<p align="center">
  <a href="https://legion.ai"><img width="250" alt="Legion logo" src="https://github.com/user-attachments/assets/bdb0c174-b9fd-40ad-a47b-f3aab9b54e8d" /></a>
</p>

<p align="center">Der Open-Source-Coding-Agent zum Entwickeln mit KI in VS Code, JetBrains oder der CLI.</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=legioncode.legion-code"><img src="https://raster.shields.io/badge/VS_Code_Marketplace-007ACC?style=flat&logo=visualstudiocode&logoColor=white" alt="VS Code Marketplace" height="20"></a>
  <a href="https://www.npmjs.com/package/@legioncode/cli"><img alt="npm" src="https://raster.shields.io/npm/v/@legioncode/cli?style=flat" height="20" /></a>
  <a href="https://x.com/legioncode"><img src="https://raster.shields.io/badge/legioncode-000000?style=flat&logo=x&logoColor=white" alt="X (Twitter)" height="20"></a>
  <a href="https://blog.legion.ai"><img src="https://raster.shields.io/badge/Blog-555?style=flat&logo=substack&logoColor=white" alt="Blog" height="20"></a>
  <a href="https://legion.ai/discord"><img src="https://raster.shields.io/badge/Join%20Discord-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord" height="20"></a>
  <a href="https://www.reddit.com/r/legioncode/"><img src="https://raster.shields.io/badge/Join%20r%2Flegioncode-D84315?style=flat&logo=reddit&logoColor=white" alt="Reddit" height="20"></a>
</p>

![Blitz-in-VS-Code-and-CLI](https://github.com/user-attachments/assets/0536ca59-ed81-4512-9e05-d186187a1b52)

---

Blitz ist ein KI-Coding-Agent, der überall dort arbeitet, wo du arbeitest: [VS Code](https://legion.ai/landing/vs-code), [JetBrains](https://legion.ai/features/jetbrains-native) und die [CLI](https://legion.ai/cli). Es ist Open Source mit transparenter Preisgestaltung. Du wählst aus über 500 Modellen, wechselst sie mitten in einer Aufgabe und zahlst den Tarif des Modellanbieters ohne Aufschlag. Zum Start sind keine API-Schlüssel erforderlich.

### Installation

Wähle aus, wo du Blitz ausführen möchtest.

<details open>
<summary><strong>VS Code</strong></summary>

<br>

Installiere die [Blitz-Erweiterung](vscode:extension/legioncode.legion-code) direkt oder lade sie aus dem [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=legioncode.legion-code). Erstelle ein Konto und erhalte Zugriff auf über 500 Modelle, darunter GPT-5.5, Claude Opus 4.7, Claude Sonnet 4.6 und Gemini 3.1 Pro Preview, alle zu Anbieterpreisen.

</details>

<details open>
<summary><strong>CLI</strong></summary>

<br>

```bash
# npm
npm install -g @legioncode/cli

# curl
curl -fsSL https://legion.ai/cli/install | bash

# pnpm
pnpm add -g @legioncode/cli

# bun
bun add -g @legioncode/cli

# Homebrew (macOS / Linux)
brew install Legion-Org/tap/kilo

# Arch Linux (AUR)
paru -S kilo-bin
```

Führe anschließend `Blitz` in einem beliebigen Projektverzeichnis aus.

</details>

<details>
<summary><strong>JetBrains</strong></summary>

<br>

Installiere das [Blitz-Plugin](https://plugins.jetbrains.com/plugin/28350-legion-code) aus dem JetBrains Marketplace oder suche in einer JetBrains-IDE unter `Settings → Plugins` nach "Blitz".

</details>

<details>
<summary><strong>Cloud Agent</strong></summary>

<br>

Führe Blitz im Web aus, ohne lokalen Rechner, unter [app.legion.ai/cloud](https://app.legion.ai/cloud).

</details>

<details>
<summary><strong>Code Reviews</strong></summary>

<br>

Richte automatisierte KI-Code-Reviews für deine Pull Requests unter [app.legion.ai/code-reviews](https://app.legion.ai/code-reviews) ein.

</details>

<details>
<summary><strong>BlitzClaw</strong></summary>

<br>

Starte deinen ständig aktiven KI-Agenten unter [app.legion.ai/claw](https://app.legion.ai/claw).

</details>

<details>
<summary>CLI aus GitHub Releases installieren (Binärdateien)</summary>

Lade die neueste Binärdatei von der [Releases-Seite](https://github.com/Legion-Org/legioncode/releases) herunter.

| Plattform | Asset |
|---|---|
| Windows (die meisten PCs) | `kilo-windows-x64.zip` |
| macOS (Apple Silicon) | `kilo-darwin-arm64.zip` |
| macOS (Intel) | `kilo-darwin-x64.zip` |
| Linux x64 | `kilo-linux-x64.tar.gz` |
| Linux ARM | `kilo-linux-arm64.tar.gz` |

Hinweise: `x64-baseline` ist ein Kompatibilitäts-Build für ältere CPUs ohne AVX. `musl` ist der statisch gelinkte Build für Alpine oder minimale Docker-Images ohne glibc. `kilo-vscode-*.vsix` ist das VS Code-Erweiterungspaket, nicht die CLI. `Source code`-Archive dienen dem Bauen aus dem Quellcode.

</details>

### Agents

Blitz wird mit spezialisierten Agents ausgeliefert, zwischen denen du je nach Aufgabe wechselst. Du kannst auch eigene Agents erstellen.

- **Code** - Standard. Implementiert und bearbeitet Code aus natürlicher Sprache.
- **Plan** - Entwirft Architektur und schreibt Implementierungspläne, bevor Code geschrieben wird.
- **Ask** - Beantwortet Fragen zu deiner Codebasis, ohne Dateien zu ändern.
- **Debug** - Untersucht und verfolgt Probleme.
- **Review** - Prüft deine Änderungen und findet Probleme bei Performance, Sicherheit, Stil und Testabdeckung.

Mehr erfahren über [Agents und benutzerdefinierte Agents](https://legion.ai/docs/code-with-ai/agents/using-agents).

### Funktionen

- **Codegenerierung** aus natürlicher Sprache über mehrere Dateien hinweg.
- **Inline-Autocomplete** mit Ghost-Text-Vorschlägen und Tab zum Übernehmen.
- **Selbstprüfung**, damit der Agent seine eigene Arbeit prüft und korrigiert.
- **Terminal- und Browsersteuerung**, um Befehle auszuführen und das Web zu automatisieren.
- **MCP-Marktplatz**, um MCP-Server zu finden und einzubinden, die den Agent erweitern.
- **Über 500 Modelle** mit Wechsel während einer Aufgabe, damit du Latenz, Kosten und Reasoning passend zur Aufgabe wählst.

### Autonomer Modus (CI/CD)

Führe `kilo run` mit `--auto` für vollständig autonomen Betrieb ohne Prompts aus, geeignet für CI/CD-Pipelines:

```bash
kilo run --auto "run tests and fix any failures"
```

`--auto` deaktiviert alle Berechtigungsabfragen und erlaubt dem Agent, jede Aktion ohne Bestätigung auszuführen. Verwende es nur in vertrauenswürdigen Umgebungen.

### Dokumentation

Für Konfiguration und alles Weitere lies die [Dokumentation](https://legion.ai/docs).

### Mitwirken

Beiträge von Entwicklerinnen, Autoren und allen anderen sind willkommen. Beginne mit dem [Contributing Guide](/CONTRIBUTING.md) für Einrichtung, Coding-Standards und Pull Requests. Siehe [RELEASING.md](../RELEASING.md) für den Release-Prozess der VS Code-Erweiterung und CLI sowie [packages/kilo-jetbrains/RELEASING.md](../packages/kilo-jetbrains/RELEASING.md) für das JetBrains-Plugin.

Bitte lies unseren [Code of Conduct](/CODE_OF_CONDUCT.md), bevor du mitwirkst.

### Lizenz

MIT. Du darfst diesen Code verwenden, ändern und verbreiten, auch kommerziell, solange du die Attribution und Lizenzhinweise beibehältst. Siehe [License](/LICENSE).

### FAQ

<details>
<summary>Woher stammt Blitz CLI?</summary>

Blitz CLI ist ein Fork von [OpenCode](https://github.com/anomalyco/opencode), erweitert für die Blitz-Agentic-Engineering-Plattform.

</details>

---

**Tritt der Community bei** [Discord](https://legion.ai/discord) | [X](https://x.com/legioncode) | [Reddit](https://www.reddit.com/r/legioncode/)
