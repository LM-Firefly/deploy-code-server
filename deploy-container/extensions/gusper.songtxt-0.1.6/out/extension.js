"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('SongTxt extension is now active.');
    // create a new word counter
    let stateNotification = new StateNotification();
    let enableCommand = vscode.commands.registerCommand('extension.enableSongtxt', () => {
        stateNotification.enabled();
    });
    let disableCommand = vscode.commands.registerCommand('extension.disableSongtxt', () => {
        stateNotification.disabled();
    });
    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(stateNotification);
    context.subscriptions.push(enableCommand);
    context.subscriptions.push(disableCommand);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
class StateNotification {
    constructor() {
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    }
    enabled() {
        // Show notification
        vscode.window.showInformationMessage('SongTxt mode is now enabled');
        // Update the status bar
        this._statusBarItem.text = 'SongTxt';
        this._statusBarItem.show();
    }
    disabled() {
        // Show notification
        vscode.window.showInformationMessage('SongTxt mode is now disabled');
        // Update the status bar
        this._statusBarItem.hide();
    }
    dispose() {
        this._statusBarItem.dispose();
    }
}
//# sourceMappingURL=extension.js.map