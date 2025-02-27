"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressIndicator = void 0;
const vscode = require("vscode");
const Constants_1 = require("./Constants");
const TimeWithMicroseconds_1 = require("./TimeWithMicroseconds");
class ProgressIndicator {
    ;
    constructor(timeCalculator, selectionHelper, timestampParser) {
        this._timeCalculator = timeCalculator;
        this._selectionHelper = selectionHelper;
        this._timestampParser = timestampParser;
    }
    setUnderlineColor(color) {
        this._decoration = vscode.window.createTextEditorDecorationType({
            borderWidth: '0 0 2px 0',
            borderStyle: 'solid',
            borderColor: color,
        });
    }
    /**
     * Decorates the lines in the specified range of the given text editor.
     *
     * @param editor - The text editor in which to decorate the lines.
     * @param startLine - The starting line of the range to decorate.
     * @param endLine - The ending line of the range to decorate.
     */
    decorateLines(editor, startLine, endLine) {
        const doc = editor.document;
        let texts = this._selectionHelper.getFirstAndLastLines(editor, doc);
        if (texts !== undefined) {
            let timePeriod = this._timeCalculator.getTimePeriod(texts.startLine, texts.endLine);
            if (timePeriod !== undefined) {
                let timestampStartIndex = this._timestampParser.getTimestampFromText(texts.endLine).matchIndex;
                let timestampWidth = this._timestampParser.getTimestampFromText(texts.endLine).original.length;
                const durationInMicroseconds = timePeriod.getDurationAsMicroseconds();
                const startTimeAsEpoch = timePeriod.startTime.getTimeAsEpoch();
                // Iterate over all lines in the selection and decorate them according to their progress
                // (i.e. how far they are from the start time of the selection to the end time of the selection)
                let ranges = [];
                for (let line = startLine; line <= endLine; line++) {
                    var lineText = editor.document.lineAt(line).text;
                    var timestamp = this._timestampParser.getTimestampFromText(lineText);
                    if (timestamp) {
                        let timestampWithMicroseconds = new TimeWithMicroseconds_1.TimeWithMicroseconds(timestamp.moment, timestamp.microseconds);
                        var progress = (timestampWithMicroseconds.getTimeAsEpoch() - startTimeAsEpoch) / durationInMicroseconds;
                        // Max progress = length of timestamp
                        var decorationCharacterCount = Math.floor(timestampWidth * progress);
                        // set decorationCharacterCount to 0 if not a number or infinit
                        if (isNaN(decorationCharacterCount) || !isFinite(decorationCharacterCount)) {
                            decorationCharacterCount = 0;
                        }
                        var range = new vscode.Range(line, timestampStartIndex, line, timestampStartIndex + decorationCharacterCount);
                        ranges.push(range);
                    }
                }
                editor.setDecorations(this._decoration, ranges);
                vscode.commands.executeCommand('setContext', Constants_1.Constants.ContextNameIsShowingProgressIndicators, true);
            }
        }
    }
    removeAllDecorations() {
        if (this._decoration) {
            vscode.window.visibleTextEditors.forEach(editor => {
                editor.setDecorations(this._decoration, []);
            });
        }
        vscode.commands.executeCommand('setContext', Constants_1.Constants.ContextNameIsShowingProgressIndicators, false);
    }
}
exports.ProgressIndicator = ProgressIndicator;
//# sourceMappingURL=ProgressIndicator.js.map