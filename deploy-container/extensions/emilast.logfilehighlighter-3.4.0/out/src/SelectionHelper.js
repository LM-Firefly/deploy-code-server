'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionHelper = void 0;
class SelectionHelper {
    getFirstAndLastLines(editor, doc) {
        const startLineNumber = editor.selection.start.line;
        const endLineNumber = editor.selection.end.line;
        if (startLineNumber !== endLineNumber) {
            let startLine;
            let endLine;
            // Iterate from the start to find the first non-empty line
            for (let i = startLineNumber; i <= endLineNumber; i++) {
                const line = doc.lineAt(i);
                if (line.text.trim() !== '') {
                    startLine = line;
                    break;
                }
            }
            // Iterate from the end to find the last non-empty line
            for (let i = endLineNumber; i >= startLineNumber; i--) {
                const line = doc.lineAt(i);
                if (line.text.trim() !== '') {
                    endLine = line;
                    break;
                }
            }
            // If startLine and endLine are set, return their text
            if (startLine && endLine) {
                return {
                    startLine: startLine.text,
                    endLine: endLine.text
                };
            }
        }
        return undefined;
    }
}
exports.SelectionHelper = SelectionHelper;
//# sourceMappingURL=SelectionHelper.js.map