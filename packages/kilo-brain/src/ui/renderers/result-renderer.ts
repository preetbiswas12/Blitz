import { TokenUsage } from '../../core/types';
import { t } from '../../i18n';

/**
 * Result Renderer - Formats Claude's responses with better structure
 */

export interface ParsedResult {
    directAnswer: string | null;
    sections: ResultSection[];
    tokenInfo?: {
        input?: number;
        output?: number;
        total?: number;
        cost?: string;
    };
}

export interface ResultSection {
    title: string;
    content: string;
    isCollapsed: boolean;
}

export class ResultRenderer {
    /**
     * Parse Claude's response into structured sections
     */
    static parseResponse(markdownText: string, tokenUsage?: TokenUsage): ParsedResult {
        const lines = markdownText.split('\n');
        const sections: ResultSection[] = [];
        let directAnswer: string | null = null;
        let currentSection: ResultSection | null = null;
        let currentContent: string[] = [];

        // Extract first meaningful paragraph as direct answer
        let firstParagraph: string[] = [];
        let foundFirstParagraph = false;

        for (const line of lines) {
            const trimmed = line.trim();

            // Skip empty lines at the start
            if (!foundFirstParagraph && !trimmed) continue;

            // Check if this is a heading
            if (trimmed.match(/^#+\s+/)) {
                // Save current section if exists
                if (currentSection) {
                    currentSection.content = currentContent.join('\n').trim();
                    sections.push(currentSection);
                    currentContent = [];
                }

                // If we haven't found the direct answer yet and have content, use it
                if (!directAnswer && firstParagraph.length > 0) {
                    directAnswer = firstParagraph.join('\n').trim();
                    foundFirstParagraph = true;
                }

                // Start new section
                const title = trimmed.replace(/^#+\s+/, '');
                currentSection = {
                    title,
                    content: '',
                    isCollapsed: true // Collapse by default
                };
            } else if (!foundFirstParagraph && trimmed) {
                // Collect lines for the first paragraph
                firstParagraph.push(line);

                // End first paragraph on empty line
                if (!trimmed && firstParagraph.length > 0) {
                    directAnswer = firstParagraph.join('\n').trim();
                    foundFirstParagraph = true;
                }
            } else if (currentSection) {
                // Add to current section
                currentContent.push(line);
            } else if (foundFirstParagraph) {
                // Content after direct answer but before first section
                currentContent.push(line);
            }
        }

        // Save last section
        if (currentSection) {
            currentSection.content = currentContent.join('\n').trim();
            sections.push(currentSection);
        }

        // If we still haven't found a direct answer, use the first few lines
        if (!directAnswer && lines.length > 0) {
            const firstLines = lines.slice(0, 3).filter(l => l.trim()).join('\n');
            if (firstLines) directAnswer = firstLines;
        }

        // If there's content after the direct answer but no sections, create an "Additional Context" section
        if (currentContent.length > 0 && sections.length === 0) {
            const additionalContent = currentContent.join('\n').trim();
            if (additionalContent) {
                sections.push({
                    title: t('result.additionalContext'),
                    content: additionalContent,
                    isCollapsed: true
                });
            }
        }

        // Format token info
        let tokenInfo = undefined;
        if (tokenUsage) {
            const cost = tokenUsage.totalTokens
                ? `$${(tokenUsage.totalTokens * 0.000003).toFixed(4)}`
                : undefined;

            tokenInfo = {
                input: tokenUsage.inputTokens,
                output: tokenUsage.outputTokens,
                total: tokenUsage.totalTokens,
                cost
            };
        }

        return {
            directAnswer,
            sections,
            tokenInfo
        };
    }

    /**
     * Render parsed result to HTML
     */
    static render(
        container: HTMLElement,
        parsed: ParsedResult,
        renderMarkdown: (text: string, el: HTMLElement) => void
    ): void {
        container.empty();

        // Render direct answer if exists
        if (parsed.directAnswer) {
            const answerBox = container.createEl('div', { cls: 'result-direct-answer' });
            const answerLabel = answerBox.createEl('div', { cls: 'result-direct-answer-label' });
            answerLabel.createEl('span', { text: '💡' });
            answerLabel.createEl('span', { text: ' ' + t('result.directAnswer') });

            const answerContent = answerBox.createEl('div', { cls: 'result-direct-answer-content' });
            renderMarkdown(parsed.directAnswer, answerContent);
        }

        // Render collapsible sections
        if (parsed.sections.length > 0) {
            for (const section of parsed.sections) {
                const sectionEl = container.createEl('details', {
                    cls: 'result-section',
                    attr: { open: !section.isCollapsed }
                });

                const summary = sectionEl.createEl('summary', {
                    cls: 'result-section-header'
                });
                summary.createEl('span', { cls: 'result-section-icon', text: '▶' });
                summary.createEl('span', { cls: 'result-section-title', text: section.title });

                const content = sectionEl.createEl('div', { cls: 'result-section-content' });
                renderMarkdown(section.content, content);
            }
        }

        // Render token info footer if exists
        if (parsed.tokenInfo) {
            const footer = container.createEl('div', { cls: 'result-footer' });

            if (parsed.tokenInfo.total) {
                footer.createEl('span', {
                    cls: 'result-token-badge',
                    text: `📊 ${parsed.tokenInfo.total.toLocaleString()} ${t('result.tokens')}`
                });
            }

            if (parsed.tokenInfo.input) {
                footer.createEl('span', {
                    cls: 'result-token-detail',
                    text: `${parsed.tokenInfo.input.toLocaleString()} ${t('result.tokensIn')}`
                });
            }

            if (parsed.tokenInfo.output) {
                footer.createEl('span', {
                    cls: 'result-token-detail',
                    text: `${parsed.tokenInfo.output.toLocaleString()} ${t('result.tokensOut')}`
                });
            }

            if (parsed.tokenInfo.cost) {
                footer.createEl('span', {
                    cls: 'result-cost-badge',
                    text: `💰 ${parsed.tokenInfo.cost}`
                });
            }
        }
    }
}
