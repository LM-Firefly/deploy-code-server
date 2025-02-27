"use strict";
var vscode = require('vscode');
var yaml = require('js-yaml');
function getIndent() {
    var editorCfg = vscode.workspace.getConfiguration('editor');
    if (editorCfg && editorCfg.get('insertSpaces')) {
        var tabSize = editorCfg.get('tabSize');
        if (tabSize && typeof tabSize === 'number') {
            return tabSize;
        }
    }
    return 2;
}
function convertSelection(conversionFn) {
    return function () {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        editor.edit(function (edit) {
            var textRange;
            if (!editor.selection.isEmpty) {
                textRange = new vscode.Range(editor.selection.start, editor.selection.end);
            }
            var text = editor.document.getText(textRange);
            var newText = conversionFn(text);
            if (newText) {
                if (!textRange) {
                    textRange = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(text.length));
                }
                edit.replace(textRange, newText);
            }
        });
    };
}
function toYAML(text) {
    var json;
    try {
        json = JSON.parse(text);
    }
    catch (e) {
        vscode.window.showErrorMessage('Could not parse the selection as JSON.');
        console.error(e);
        return;
    }
    return yaml.safeDump(json, { indent: getIndent() });
}
exports.toYAML = toYAML;
function toJSON(text) {
    var json;
    try {
        json = yaml.safeLoad(text, { schema: yaml.JSON_SCHEMA });
    }
    catch (e) {
        vscode.window.showErrorMessage('Could not parse the selection as YAML.');
        console.error(e);
        return;
    }
    return JSON.stringify(json, null, getIndent());
}
exports.toJSON = toJSON;
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('json2yaml.toYAML', convertSelection(toYAML)));
    context.subscriptions.push(vscode.commands.registerCommand('json2yaml.toJSON', convertSelection(toJSON)));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map