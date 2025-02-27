"use strict";
/**
 * Helper functions for SCL editor
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotSCLEditor = isNotSCLEditor;
exports.documentHasURI = documentHasURI;
const vscode_1 = require("vscode");
function isNotSCLEditor() {
    let activeEditor = vscode_1.window.activeTextEditor;
    return !activeEditor || !activeEditor.document || activeEditor.document.languageId !== 'scl';
}
function documentHasURI() {
    return vscode_1.window.activeTextEditor.document.uri instanceof vscode_1.Uri;
}
