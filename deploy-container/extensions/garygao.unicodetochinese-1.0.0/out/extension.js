'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
var Window = vscode.window;
var Range = vscode.Range;
function activate(context) {
    console.log('Congratulations, your extension "UnicodeToChinese" is now active!');
    let disposable = vscode.commands.registerCommand('extension.unicodeToChinese', () => {
        let e = Window.activeTextEditor;
        let d = e.document;
        let sel = e.selections;
        e.edit(function (edit) {
            // itterate through the selections and convert all text to Upper
            for (var x = 0; x < sel.length; x++) {
                let txt = d.getText(new Range(sel[x].start, sel[x].end));
                edit.replace(sel[x], unescape(txt.replace(/\\u/g, '%u')));
            }
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map