'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomPattern = void 0;
const vscode = require("vscode");
class CustomPattern {
    constructor(pattern, patternFlags, highlightEntireLine, foreground, background, fontWeight, fontStyle, border, borderRadius, borderSpacing, letterSpacing, overviewRulerColor, overviewRulerLane, textDecoration) {
        this.pattern = pattern;
        this.foreground = foreground;
        this.background = background;
        this.regexes = this.createRegex(pattern, patternFlags, highlightEntireLine);
        this.decoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: this.background,
            color: this.foreground,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            border: border,
            borderRadius: borderRadius,
            borderSpacing: borderSpacing,
            letterSpacing: letterSpacing,
            overviewRulerColor: overviewRulerColor,
            overviewRulerLane: overviewRulerLane,
            textDecoration: textDecoration,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        });
    }
    dispose() {
        this.decoration.dispose();
    }
    createRegex(pattern, patternFlags, highlightEntireLine) {
        const result = [];
        if (highlightEntireLine) {
            pattern = '^.*' + pattern + '.*$';
        }
        try {
            result.push(new RegExp(pattern, 'gm' + patternFlags));
        }
        catch (err) {
            vscode.window.showErrorMessage('Regex of custom log level is invalid. Error: ' + err);
        }
        return result;
    }
}
exports.CustomPattern = CustomPattern;
//# sourceMappingURL=CustomPattern.js.map