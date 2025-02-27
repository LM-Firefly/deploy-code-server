"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.template = exports.mkdir = exports.open = void 0;
const Open = require("open");
const Fs = require("fs");
const Path = require("path");
const vscode_1 = require("vscode");
const open = (path) => {
    return Open(path, { wait: true });
};
exports.open = open;
const mkdir = (path) => {
    return Fs.mkdirSync(path, { recursive: true });
};
exports.mkdir = mkdir;
const template = (rootPath, htmlPath, data = false) => {
    const AbsHtmlPath = Path.join(rootPath, htmlPath);
    const dirPath = Path.dirname(AbsHtmlPath);
    let result = Fs.readFileSync(AbsHtmlPath, 'utf-8').replace(/(@)(.+?)"/g, (m, $1, $2) => {
        return vscode_1.Uri.file(Path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
    });
    if (data) {
        result = result.replace(/(\{\{)(.+?)(\}\})/g, (m, $1, $2) => {
            return data[$2.trim()];
        });
    }
    return result;
};
exports.template = template;
//# sourceMappingURL=index.js.map