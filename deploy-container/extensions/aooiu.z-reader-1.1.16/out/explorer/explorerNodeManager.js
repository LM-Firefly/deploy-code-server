"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.explorerNodeManager = void 0;
const vscode_1 = require("vscode");
const TreeNode_1 = require("./TreeNode");
const reader_1 = require("../reader");
class ExplorerNodeManager {
    constructor() {
        this.treeNode = [];
    }
    getChildren() {
        return this.treeNode;
    }
    getAllBooks() {
        return new Promise((resolve) => {
            reader_1.readerDriver.getAllBooks().then((treeNode) => {
                this.treeNode = treeNode;
                resolve(this.treeNode);
            });
        });
    }
    setTreeNode(treeNode) {
        this.treeNode = treeNode;
    }
    equalsTreeNode(a, b) {
        return a.path === b.path && a.name === b.name && a.type === b.type;
    }
    // 获取
    getChapter(treeNode) {
        return __awaiter(this, void 0, void 0, function* () {
            const vConfig = vscode_1.workspace.getConfiguration('z-reader');
            const chapterOrder = vConfig.get('chapterOrder', '顺序');
            const tNode = this.treeNode.find((e) => this.equalsTreeNode(e, treeNode));
            try {
                const chapters = yield reader_1.readerDriver.getChapter(treeNode);
                if (tNode) {
                    tNode.children = [...chapters];
                }
                if (chapterOrder === '倒序') {
                    chapters.reverse();
                }
                return chapters;
            }
            catch (error) {
                return [];
            }
        });
    }
    dispose() {
        this.treeNode = [];
    }
    nextChapter(currentNode) {
        const treeNodes = this.treeNode.map((e) => e.children).filter((e) => e);
        let isFind = false;
        for (let i = 0; i < treeNodes.length; i++) {
            const element = treeNodes[i];
            for (let ii = 0; ii < element.length; ii++) {
                const rowNode = new TreeNode_1.TreeNode(element[ii]);
                if (isFind) {
                    return rowNode;
                }
                if (this.equalsTreeNode(rowNode, currentNode)) {
                    isFind = true;
                }
            }
        }
    }
    lastChapter(currentNode) {
        const treeNodes = this.treeNode.map((e) => e.children).filter((e) => e);
        for (let i = 0; i < treeNodes.length; i++) {
            const element = treeNodes[i];
            for (let ii = 1; ii < element.length; ii++) {
                const rowNode = new TreeNode_1.TreeNode(element[ii]);
                if (this.equalsTreeNode(rowNode, currentNode)) {
                    return new TreeNode_1.TreeNode(element[ii - 1]);
                }
            }
        }
    }
}
exports.explorerNodeManager = new ExplorerNodeManager();
//# sourceMappingURL=explorerNodeManager.js.map