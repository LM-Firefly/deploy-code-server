"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const transverter_1 = require("./transverter");
const COMMANDS = [
    {
        command: 'zh-hans-to-zh-hant',
        options: { type: 'traditional', language: '' },
    },
    {
        command: 'zh-hant-to-zh-hans',
        options: { type: 'simplified', language: '' },
    },
    {
        command: 'zh-hans-to-zh-hant-tw',
        options: { type: 'traditional', language: 'zh_TW' },
    },
    {
        command: 'zh-hant-to-zh-hans-tw',
        options: { type: 'simplified', language: 'zh_TW' },
    },
];
function process(textEditor, options) {
    const doc = textEditor.document;
    let selection = textEditor.selection;
    if (selection.isEmpty) {
        const start = new vscode_1.Position(0, 0);
        const end = new vscode_1.Position(doc.lineCount - 1, doc.lineAt(doc.lineCount - 1).text.length);
        selection = new vscode_1.Range(start, end);
    }
    let text = doc.getText(selection);
    textEditor.edit(builder => {
        builder.replace(selection, transverter_1.transverter(text, options));
    });
}
function activate(context) {
    COMMANDS.forEach(item => {
        context.subscriptions.push(vscode_1.commands.registerTextEditorCommand(item.command, textEditor => {
            process(textEditor, item.options);
        }));
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map