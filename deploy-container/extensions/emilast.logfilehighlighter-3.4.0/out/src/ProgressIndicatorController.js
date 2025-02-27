'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressIndicatorController = void 0;
const vscode = require("vscode");
class ProgressIndicatorController {
    constructor(progressIndicator) {
        this._progressIndicator = progressIndicator;
        this.init();
        vscode.workspace.onDidChangeConfiguration(() => { this.onDidChangeConfiguration(); }, this);
    }
    removeDecorations() {
        this._progressIndicator.removeAllDecorations();
        this.clearEditorSelections();
    }
    clearEditorSelections() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current active cursor position
            const currentPosition = editor.selection.active;
            // Clear selections by setting the selection to the current cursor position
            editor.selection = new vscode.Selection(currentPosition, currentPosition);
        }
    }
    getConfiguration() {
        const config = vscode.workspace.getConfiguration('logFileHighlighter');
        const enableProgressIndicator = config.get('enableProgressIndicator', true);
        const progressIndicatorUnderlineColor = config.get('progressIndicatorUnderlineColor', '#00ff1f8f');
        return {
            enableProgressIndicator,
            progressIndicatorUnderlineColor
        };
    }
    dispose() {
        this._statusBarItem.dispose();
        this._disposableSubscriptions.dispose();
    }
    onDidChangeConfiguration() {
        this.init();
    }
    init() {
        const config = this.getConfiguration();
        if (config.enableProgressIndicator) {
            this.registerSelectionEventHandlers();
            this._progressIndicator.removeAllDecorations(); // Do this before the call to setUnderlineColor since the decoration object will be recreated
            this._progressIndicator.setUnderlineColor(config.progressIndicatorUnderlineColor);
        }
        else {
            // Remove all decorations in case they're disabled now or have changed settings
            this._progressIndicator.removeAllDecorations();
            // Unregister all event listeners
            this.unregisterSelectionEventHandlers();
        }
    }
    registerSelectionEventHandlers() {
        this.unregisterSelectionEventHandlers();
        const subscriptions = [];
        vscode.window.onDidChangeTextEditorSelection(event => this.decorateLines(event), this, subscriptions);
        this._disposableSubscriptions = vscode.Disposable.from(...subscriptions);
    }
    unregisterSelectionEventHandlers() {
        if (this._disposableSubscriptions) {
            this._disposableSubscriptions.dispose();
            this._disposableSubscriptions = null;
        }
    }
    /// Decorates the lines in the specified range of the given text editor.
    decorateLines(event) {
        if (event.textEditor === vscode.window.activeTextEditor) {
            for (const selection of event.selections) {
                this._progressIndicator.decorateLines(event.textEditor, selection.start.line, selection.end.line);
            }
        }
    }
}
exports.ProgressIndicatorController = ProgressIndicatorController;
//# sourceMappingURL=ProgressIndicatorController.js.map