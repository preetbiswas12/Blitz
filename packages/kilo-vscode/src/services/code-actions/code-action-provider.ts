import * as vscode from "vscode"

export class KiloCodeActionProvider implements vscode.CodeActionProvider {
  static readonly metadata: vscode.CodeActionProviderMetadata = {
    providedCodeActionKinds: [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.RefactorRewrite],
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
  ): vscode.CodeAction[] {
    if (range.isEmpty) return []

    const actions: vscode.CodeAction[] = []

    const add = new vscode.CodeAction("Add to Blitx", vscode.CodeActionKind.RefactorRewrite)
    add.command = { command: "blitx-code.new.addToContext", title: "Add to Blitx" }
    actions.push(add)

    const hasDiagnostics = context.diagnostics.length > 0

    if (hasDiagnostics) {
      const fix = new vscode.CodeAction("Fix with Blitx", vscode.CodeActionKind.QuickFix)
      fix.command = { command: "blitx-code.new.fixCode", title: "Fix with Blitx" }
      fix.isPreferred = true
      actions.push(fix)
    }

    if (!hasDiagnostics) {
      const explain = new vscode.CodeAction("Explain with Blitx", vscode.CodeActionKind.RefactorRewrite)
      explain.command = { command: "blitx-code.new.explainCode", title: "Explain with Blitx" }
      actions.push(explain)

      const improve = new vscode.CodeAction("Improve with Blitx", vscode.CodeActionKind.RefactorRewrite)
      improve.command = { command: "blitx-code.new.improveCode", title: "Improve with Blitx" }
      actions.push(improve)
    }

    return actions
  }
}
