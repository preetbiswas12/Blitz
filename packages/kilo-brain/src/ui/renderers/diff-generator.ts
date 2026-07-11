import { t } from '../../i18n';

/**
 * Utility for generating side-by-side diff views (IntelliJ-style)
 */
export interface DiffChange {
    type: 'equal' | 'delete' | 'insert' | 'modify';
    oldContent?: string;
    newContent?: string;
    oldLineNum?: number;
    newLineNum?: number;
}

export class DiffGenerator {
    /**
     * Generate side-by-side diff view as a DOM element between original and modified content
     *
     * @param original Original content
     * @param modified Modified content
     * @returns HTMLElement representing the side-by-side diff
     */
    static generateDiffElement(original: string, modified: string): HTMLElement {
        const originalLines = original.split('\n');
        const modifiedLines = modified.split('\n');

        // Compute diff
        const diff = this.computeDiff(originalLines, modifiedLines);

        const container = document.createElement('div');
        container.className = 'claude-code-diff-side-by-side';

        // Header
        const header = document.createElement('div');
        header.className = 'diff-header';

        const leftHeader = document.createElement('div');
        leftHeader.className = 'diff-column diff-column-left';
        const leftTitle = document.createElement('span');
        leftTitle.className = 'diff-header-title';
        leftTitle.textContent = t('diff.original');
        leftHeader.appendChild(leftTitle);

        const rightHeader = document.createElement('div');
        rightHeader.className = 'diff-column diff-column-right';
        const rightTitle = document.createElement('span');
        rightTitle.className = 'diff-header-title';
        rightTitle.textContent = t('diff.modified');
        rightHeader.appendChild(rightTitle);

        header.appendChild(leftHeader);
        header.appendChild(rightHeader);
        container.appendChild(header);

        // Content
        const content = document.createElement('div');
        content.className = 'diff-content';

        for (const change of diff) {
            const row = document.createElement('div');
            row.className = `diff-row diff-${change.type}`;

            if (change.type === 'equal') {
                row.appendChild(this.createDiffColumn('left', change.oldLineNum, change.oldContent));
                row.appendChild(this.createDiffColumn('right', change.newLineNum, change.newContent));
            } else if (change.type === 'delete') {
                row.appendChild(this.createDiffColumn('left', change.oldLineNum, change.oldContent));
                row.appendChild(this.createDiffColumn('right', undefined, undefined, true));
            } else if (change.type === 'insert') {
                row.appendChild(this.createDiffColumn('left', undefined, undefined, true));
                row.appendChild(this.createDiffColumn('right', change.newLineNum, change.newContent));
            } else if (change.type === 'modify') {
                row.appendChild(this.createDiffColumn('left', change.oldLineNum, change.oldContent));
                row.appendChild(this.createDiffColumn('right', change.newLineNum, change.newContent));
            }

            content.appendChild(row);
        }

        container.appendChild(content);
        return container;
    }

    /**
     * Create a diff column element
     */
    private static createDiffColumn(side: 'left' | 'right', lineNum?: number, content?: string, isEmpty: boolean = false): HTMLElement {
        const column = document.createElement('div');
        column.className = `diff-column diff-column-${side}${isEmpty ? ' diff-empty' : ''}`;

        const lineNumSpan = document.createElement('span');
        lineNumSpan.className = 'diff-line-number';
        lineNumSpan.textContent = lineNum !== undefined ? String(lineNum) : '';

        const contentSpan = document.createElement('span');
        contentSpan.className = 'diff-line-content';
        contentSpan.textContent = content || '';

        column.appendChild(lineNumSpan);
        column.appendChild(contentSpan);

        return column;
    }

    /**
     * Compute diff between two arrays of lines using a simple algorithm
     *
     * @param oldLines Original lines
     * @param newLines Modified lines
     * @returns Array of diff changes
     */
    private static computeDiff(oldLines: string[], newLines: string[]): DiffChange[] {
        const result: DiffChange[] = [];

        let oldIndex = 0;
        let newIndex = 0;
        let oldLineNum = 1;
        let newLineNum = 1;

        while (oldIndex < oldLines.length || newIndex < newLines.length) {
            if (oldIndex >= oldLines.length) {
                // Remaining lines are insertions
                result.push({
                    type: 'insert',
                    newContent: newLines[newIndex],
                    newLineNum: newLineNum
                });
                newIndex++;
                newLineNum++;
            } else if (newIndex >= newLines.length) {
                // Remaining lines are deletions
                result.push({
                    type: 'delete',
                    oldContent: oldLines[oldIndex],
                    oldLineNum: oldLineNum
                });
                oldIndex++;
                oldLineNum++;
            } else if (oldLines[oldIndex] === newLines[newIndex]) {
                // Lines are equal
                result.push({
                    type: 'equal',
                    oldContent: oldLines[oldIndex],
                    newContent: newLines[newIndex],
                    oldLineNum: oldLineNum,
                    newLineNum: newLineNum
                });
                oldIndex++;
                newIndex++;
                oldLineNum++;
                newLineNum++;
            } else {
                // Lines are different - check if it's a modification or delete+insert
                // For now, treat consecutive different lines as modifications
                result.push({
                    type: 'modify',
                    oldContent: oldLines[oldIndex],
                    newContent: newLines[newIndex],
                    oldLineNum: oldLineNum,
                    newLineNum: newLineNum
                });
                oldIndex++;
                newIndex++;
                oldLineNum++;
                newLineNum++;
            }
        }

        return result;
    }
}
