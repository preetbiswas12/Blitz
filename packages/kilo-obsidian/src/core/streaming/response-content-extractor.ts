/**
 * Utility for detecting permission requests in Claude's responses
 */
export class ResponseContentExtractor {
    /**
     * Detect if Claude's response is asking for permission to perform an action
     *
     * @param text The text content to analyze
     * @returns True if the text contains a permission request pattern
     */
    static detectPermissionRequest(text: string): boolean {
        // Check for explicit REQUIRED_APPROVAL keyword
        return text.includes('REQUIRED_APPROVAL');
    }
}
