'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TailController = void 0;
const vscode = require("vscode");
const Constants_1 = require("./Constants");
class TailController {
    constructor() {
        this._tailModeActive = false;
        vscode.workspace.onDidChangeConfiguration(() => { this.onDidChangeConfiguration(); }, this);
        this.init();
    }
    init() {
        const config = this.getConfiguration();
        if (config.enableTailMode) {
            // Create as needed
            if (!this._statusBarItem) {
                this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
                this._statusBarItem.tooltip = 'The end of the file is visible, which activates the Log File Highlighter tail mode. When active, the editor will automatically scroll to the end of the file when new lines are added.';
            }
            // subscribe to selection change and editor activation events
            const subscriptions = [];
            vscode.workspace.onDidChangeTextDocument(event => {
                this.tailLogFile(event.document);
            }, this, subscriptions);
            vscode.window.onDidChangeTextEditorVisibleRanges(event => {
                this.checkEndOfFileVisibilityInActiveEditor();
            }, this, subscriptions);
            vscode.window.onDidChangeActiveTextEditor(event => {
                this.editorChanged(event);
            }, this, subscriptions);
            // create a combined disposable from both event subscriptions
            this._disposable = vscode.Disposable.from(...subscriptions);
            this.checkEndOfFileVisibilityInActiveEditor();
        }
        else {
            this.dispose;
        }
    }
    onDidChangeConfiguration() {
        this.init();
    }
    dispose() {
        this._statusBarItem.dispose();
        this._disposable.dispose();
    }
    getConfiguration() {
        const config = vscode.workspace.getConfiguration('logFileHighlighter');
        const enableTailMode = config.get('enableTailMode', true);
        return {
            enableTailMode
        };
    }
    checkEndOfFileVisibilityInActiveEditor() {
        const textEditor = vscode.window.activeTextEditor;
        if (textEditor) {
            const visibleRanges = textEditor.visibleRanges;
            if (visibleRanges && (textEditor === null || textEditor === void 0 ? void 0 : textEditor.document.languageId) === Constants_1.Constants.LogLanguageId) {
                const lastLine = textEditor.document.lineCount - 1;
                const lastVisibleRange = visibleRanges[0].end.line;
                if (lastVisibleRange >= lastLine) {
                    // The end of the file is visible
                    this._tailModeActive = true;
                    this._statusBarItem.text = 'Log File Tail Mode';
                    this._statusBarItem.show();
                    return;
                }
            }
        }
        // Else: Not a log file, or the end of the file is not visible => no tail mode
        this._tailModeActive = false;
        this._statusBarItem.hide();
    }
    editorChanged(event) {
        this.checkEndOfFileVisibilityInActiveEditor();
    }
    tailLogFile(document) {
        var _a;
        // Check if tail mode is active and the document is the active editor
        if (this._tailModeActive && ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document) === document) {
            // Get the last line number
            const lastLine = document.lineCount - 1;
            const range = new vscode.Range(lastLine, 0, lastLine, 0);
            // Scroll to the last line
            vscode.window.activeTextEditor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        }
    }
}
exports.TailController = TailController;
//# sourceMappingURL=TailController.js.map