'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimePeriodController = void 0;
const vscode = require("vscode");
class TimePeriodController {
    constructor(timeCalculator, selectionHelper) {
        this._timeCalculator = timeCalculator;
        this._selectionHelper = selectionHelper;
        // Create as needed
        if (!this._statusBarItem) {
            this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }
        // subscribe to selection change and editor activation events
        const subscriptions = [];
        vscode.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);
        // update the counter for the current file
        this.updateTimePeriod();
        // create a combined disposable from both event subscriptions
        this._disposable = vscode.Disposable.from(...subscriptions);
    }
    dispose() {
        this._statusBarItem.dispose();
        this._disposable.dispose();
    }
    updateTimePeriod() {
        // Get the current text editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }
        const doc = editor.document;
        // Only update status if an log file
        if (doc.languageId === 'log') {
            this._statusBarItem.text = '';
            let texts = this._selectionHelper.getFirstAndLastLines(editor, doc);
            if (texts !== undefined) {
                let timePeriod = this._timeCalculator.getTimePeriod(texts.startLine, texts.endLine);
                if (timePeriod !== undefined) {
                    // Update the status bar
                    this._statusBarItem.text = this._timeCalculator.convertToDisplayString(timePeriod.duration);
                    this._statusBarItem.show();
                }
                else {
                    this._statusBarItem.hide();
                }
            }
        }
        else {
            this._statusBarItem.hide();
        }
    }
    _onEvent() {
        this.updateTimePeriod();
    }
}
exports.TimePeriodController = TimePeriodController;
//# sourceMappingURL=TimePeriodController%20copy.js.map