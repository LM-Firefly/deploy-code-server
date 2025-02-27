"use strict";
/**
 * Helper functions for CML editor
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotCMLEditor = isNotCMLEditor;
exports.documentHasURI = documentHasURI;
const vscode_1 = require("vscode");
function isNotCMLEditor() {
    let activeEditor = vscode_1.window.activeTextEditor;
    return !activeEditor || !activeEditor.document || activeEditor.document.languageId !== 'cml';
}
function documentHasURI() {
    return vscode_1.window.activeTextEditor.document.uri instanceof vscode_1.Uri;
}
