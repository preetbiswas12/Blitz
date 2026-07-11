import { ClaudeCodeSettings } from './settings';

/**
 * Configuration for building CLI arguments
 */
export interface CliArgsConfig {
    settings: ClaudeCodeSettings;
    sessionId: string | null;
    vaultPath: string | null;
    bypassPermissions: boolean;
    runtimeModelOverride?: string;
}

/**
 * Builds command-line arguments for Claude Code CLI
 */
export class CliArgsBuilder {
    /**
     * Build CLI arguments array
     *
     * @param config Configuration for CLI arguments
     * @returns Array of CLI arguments
     */
    static buildArgs(config: CliArgsConfig): string[] {
        const args: string[] = [];

        // Output format arguments
        args.push('--print');
        args.push('--verbose');
        args.push('--output-format', 'stream-json');
        args.push('--input-format', 'stream-json');
        args.push('--replay-user-messages');
        args.push('--include-partial-messages');

        // Resume existing session if available
        if (config.sessionId) {
            args.push('--resume', config.sessionId);
        }

        // Permission mode
        if (config.settings.enablePermissionlessMode || config.bypassPermissions) {
            args.push('--permission-mode', 'bypassPermissions');
        }else{
           args.push('--permission-mode', 'acceptEdits');

        }

        // Vault access
        if (config.settings.allowVaultAccess && config.vaultPath) {
            args.push('--add-dir', config.vaultPath);
        }

        // Model selection - runtime override takes priority
        const modelToUse = config.runtimeModelOverride || config.settings.modelAlias;
        if (modelToUse) {
            args.push('--model', modelToUse);
        }

        return args;
    }
}
