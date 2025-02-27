"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeNode = exports.defaultTreeNode = void 0;
const config_1 = require("../config");
exports.defaultTreeNode = {
    type: '.txt',
    name: '',
    isDirectory: false,
    path: '',
    children: []
};
class TreeNode {
    constructor(data) {
        this.data = data;
    }
    get name() {
        return this.data.name;
    }
    get type() {
        return this.data.type;
    }
    get path() {
        return this.data.path;
    }
    get isDirectory() {
        return this.data.isDirectory;
    }
    set children(iReader) {
        this.data.children = iReader;
    }
    get children() {
        return this.data.children;
    }
    get previewCommand() {
        return {
            title: this.data.name,
            command: config_1.Commands.openReaderWebView,
            arguments: [this]
        };
    }
}
exports.TreeNode = TreeNode;
//# sourceMappingURL=TreeNode.js.map