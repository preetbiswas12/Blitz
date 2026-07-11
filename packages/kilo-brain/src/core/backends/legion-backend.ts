/**
 * Legion CLI Backend Adapter
 * Handles communication with the Legion CLI
 */

import * as path from 'path';
import * as fs from 'fs';
import type { ClaudeCodeSettings } from '../settings';
import type { CLIBackend, BackendConfig, StandardEvent, OpenCodeRawEvent, BackendType } from './types';

/**
 * Backend adapter for Legion CLI
 * Nearly identical to OpenCode since Legion is a fork of OpenCode
 */
export class LegionBackend implements CLIBackend {
    readonly name: BackendType = 'legion' as BackendType;

    /** Track if we've seen the first step_start (used for init) */
    private hasSeenInit = false;

    /**
     * Build CLI arguments for Legion
     */
    buildArgs(config: BackendConfig): string[] {
        const args: string[] = ['run'];

        // JSON output format
        args.push('--format', 'json');

        // Resume existing session if available
        if (config.sessionId) {
            args.push('--session', config.sessionId);
        }

        // Model selection (Legion uses provider/model format)
        if (config.model) {
            args.push('-m', config.model);
        }

        return args;
    }

    /**
     * Parse Legion CLI event into normalized format
     * Same wire format as OpenCode since Legion is a fork
     */
    parseEvent(rawEvent: unknown): StandardEvent | null {
        const event = rawEvent as OpenCodeRawEvent;

        switch (event.type) {
            case 'step_start':
                return this.parseStepStartEvent(event);

            case 'text':
                return this.parseTextEvent(event);

            case 'tool_use':
                return this.parseToolUseEvent(event);

            case 'step_finish':
                return this.parseStepFinishEvent(event);

            default:
                return null;
        }
    }

    private parseStepStartEvent(event: OpenCodeRawEvent): StandardEvent | null {
        if (!this.hasSeenInit) {
            this.hasSeenInit = true;
            return {
                type: 'init',
                sessionId: event.sessionID,
            };
        }
        return null;
    }

    private parseTextEvent(event: OpenCodeRawEvent): StandardEvent | null {
        const text = event.part?.text;
        if (!text) return null;

        return {
            type: 'text',
            text: text,
            sessionId: event.sessionID,
            isStreaming: true,
        };
    }

    private parseToolUseEvent(event: OpenCodeRawEvent): StandardEvent | null {
        const part = event.part;
        if (!part) return null;

        const toolName = part.tool || 'unknown';
        const state = part.state;

        if (!state) {
            return {
                type: 'tool_start',
                toolName,
                sessionId: event.sessionID,
            };
        }

        if (state.status === 'completed') {
            return {
                type: 'tool_result',
                toolName,
                toolInput: state.input,
                toolOutput: state.output,
                sessionId: event.sessionID,
            };
        } else {
            return {
                type: 'tool_start',
                toolName,
                toolInput: state.input,
                sessionId: event.sessionID,
            };
        }
    }

    private parseStepFinishEvent(event: OpenCodeRawEvent): StandardEvent {
        const part = event.part;
        const tokens = part?.tokens;

        return {
            type: 'step_complete',
            cost: part?.cost || 0,
            tokens: tokens ? {
                input: tokens.input || 0,
                output: tokens.output || 0,
                cached: tokens.cache?.read || 0,
            } : undefined,
            sessionId: event.sessionID,
        };
    }

    /**
     * Extract session ID from raw event
     */
    extractSessionId(rawEvent: unknown): string | null {
        const event = rawEvent as OpenCodeRawEvent;
        return event.sessionID || null;
    }

    /**
     * Get executable path from settings
     */
    getExecutablePath(settings: ClaudeCodeSettings): string {
        if ((settings as any).legionAutoDetect) {
            const detected = this.detectInstallation();
            if (detected) return detected;
        }
        return (settings as any).legionPath || 'legion';
    }

    /**
     * Detect Legion CLI installation
     */
    detectInstallation(): string | null {
        const homeDir = process.env.HOME || process.env.USERPROFILE || '';
        const isWindows = process.platform === 'win32';

        const possiblePaths = isWindows ? [
            path.join(homeDir, 'AppData', 'Roaming', 'npm', 'legion.cmd'),
            path.join(homeDir, '.bun', 'bin', 'legion.exe'),
        ] : [
            path.join(homeDir, '.local', 'bin', 'legion'),
            path.join(homeDir, '.bun', 'bin', 'legion'),
            '/usr/local/bin/legion',
            '/usr/bin/legion',
        ];

        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                return p;
            }
        }

        return null;
    }

    /**
     * Legion requires stdin input for the prompt
     */
    requiresStdinInput(): boolean {
        return true;
    }

    /**
     * Format stdin input for Legion
     * Legion accepts plain text via stdin (same as OpenCode)
     */
    formatStdinInput(prompt: string): string {
        return prompt;
    }

    /**
     * Reset state for new session
     */
    reset(): void {
        this.hasSeenInit = false;
    }
}
