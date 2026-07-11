/**
 * Agent Activity Tracker - Manages agent activity display
 */

import { AgentStep } from '../core/types';

export class AgentActivityTracker {
    private agentSteps: Map<string, HTMLElement> = new Map();
    private agentStepsContainer: HTMLElement | null = null;
    private agentActivitySection: HTMLElement | null = null;
    private agentContainer: HTMLElement | null = null;
    private stepTimers: Map<string, NodeJS.Timeout> = new Map();
    private stepStartTimes: Map<string, number> = new Map();

    /**
     * Initialize the tracker with DOM elements
     */
    initialize(agentActivitySection: HTMLElement): void {
        this.agentActivitySection = agentActivitySection;
        this.agentStepsContainer = agentActivitySection.querySelector('#claude-code-agent-steps');
        // Get reference to the main container
        this.agentContainer = document.getElementById('claude-code-agent-container');
    }

    /**
     * Add or update an agent step
     */
    addStep(step: AgentStep): void {
        if (!this.agentStepsContainer || !this.agentActivitySection) return;

        // Show the activity section when adding steps
        this.agentActivitySection.removeClass('claude-code-hidden');

        // Show the agent container
        if (this.agentContainer) {
            this.agentContainer.removeClass('claude-code-hidden');
        }

        // Check if we already have this step - update it if so
        if (this.agentSteps.has(step.key)) {
            const existingEl = this.agentSteps.get(step.key)!;

            // If duration is provided, this step is complete
            if (step.duration !== undefined) {
                // Stop the live timer for this step
                this.stopStepTimer(step.key);

                // Remove old duration if exists
                const oldDuration = existingEl.querySelector('.agent-step-duration');
                if (oldDuration) {
                    oldDuration.remove();
                }

                // Add final duration badge
                const durationText = this.formatDuration(step.duration);
                existingEl.createEl('span', {
                    cls: 'agent-step-duration agent-step-duration-complete',
                    text: durationText
                });
            }
            return;
        }

        // Create the step element
        const stepEl = this.agentStepsContainer.createEl('div', {
            cls: 'claude-code-agent-step'
        });

        stepEl.createEl('span', {
            cls: 'agent-step-icon',
            text: step.icon
        });

        stepEl.createEl('span', {
            cls: 'agent-step-action',
            text: step.action
        });

        stepEl.createEl('span', {
            cls: 'agent-step-target',
            text: step.target
        });

        // Add timing information
        if (step.duration !== undefined) {
            // Step is already complete
            const durationText = this.formatDuration(step.duration);
            stepEl.createEl('span', {
                cls: 'agent-step-duration agent-step-duration-complete',
                text: durationText
            });
        } else if (step.startTime !== undefined) {
            // Step is in progress - show live elapsed time
            const durationEl = stepEl.createEl('span', {
                cls: 'agent-step-duration agent-step-duration-live',
                text: '0.0s'
            });

            // Start live timer
            this.startStepTimer(step.key, step.startTime, durationEl);
        }

        // Store the element
        this.agentSteps.set(step.key, stepEl);

        // Auto-scroll to the bottom to show the latest step
        this.agentStepsContainer.scrollTop = this.agentStepsContainer.scrollHeight;
    }

    /**
     * Start a live timer for a step
     */
    private startStepTimer(key: string, startTime: number, durationEl: HTMLElement): void {
        // Store start time
        this.stepStartTimes.set(key, startTime);

        // Update every 100ms
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const formatted = this.formatDuration(elapsed);
            durationEl.textContent = formatted;
        }, 100);

        this.stepTimers.set(key, timer);
    }

    /**
     * Stop the live timer for a step
     */
    private stopStepTimer(key: string): void {
        const timer = this.stepTimers.get(key);
        if (timer) {
            clearInterval(timer);
            this.stepTimers.delete(key);
        }
        this.stepStartTimes.delete(key);
    }

    /**
     * Clear all agent steps
     */
    clear(): void {
        // Stop all timers
        for (const timer of this.stepTimers.values()) {
            clearInterval(timer);
        }
        this.stepTimers.clear();
        this.stepStartTimes.clear();

        if (this.agentStepsContainer) {
            this.agentStepsContainer.empty();
        }
        this.agentSteps.clear();

        // Hide the activity column when empty
        if (this.agentActivitySection) {
            this.agentActivitySection.addClass('claude-code-hidden');
        }

        // Note: We don't hide the main container here because the todo list might still be visible
    }

    /**
     * Restore agent steps from an array
     */
    restore(steps: AgentStep[]): void {
        this.clear();
        for (const step of steps) {
            this.addStep(step);
        }
    }

    /**
     * Get all current steps
     */
    getSteps(): AgentStep[] {
        return Array.from(this.agentSteps.keys()).map(key => {
            const [action, target] = key.split('-');
            const stepEl = this.agentSteps.get(key)!;
            const icon = stepEl.querySelector('.agent-step-icon')?.textContent || '🔧';
            return { icon, action, target, key };
        });
    }

    /**
     * Format duration in a human-readable way
     */
    private formatDuration(ms: number): string {
        if (ms < 1000) {
            return `${ms}ms`;
        } else if (ms < 60000) {
            return `${(ms / 1000).toFixed(1)}s`;
        } else {
            const minutes = Math.floor(ms / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            return `${minutes}m ${seconds}s`;
        }
    }
}
