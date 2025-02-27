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
exports.treeDataProvider = void 0;
const vscode = require("vscode");
const explorerNodeManager_1 = require("./explorerNodeManager");
class TreeDataProvider {
    constructor() {
        // private context: vscode.ExtensionContext;
        this.onDidChangeTreeDataEvent = new vscode.EventEmitter();
        this.onDidChangeTreeData = this.onDidChangeTreeDataEvent.event;
    }
    initialize() {
        // ...
    }
    dispose() {
        this.fire();
    }
    fire() {
        this.onDidChangeTreeDataEvent.fire(null);
    }
    getTreeItem(element) {
        // 这里要返回最终显示的
        return {
            label: element.name,
            tooltip: element.name,
            iconPath: '',
            collapsibleState: element.isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
            command: !element.isDirectory ? element.previewCommand : undefined
            // contextValue
        };
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!element) {
                return explorerNodeManager_1.explorerNodeManager.getChildren();
            }
            return yield explorerNodeManager_1.explorerNodeManager.getChapter(element);
        });
    }
}
exports.treeDataProvider = new TreeDataProvider();
//# sourceMappingURL=treeDataProvider.js.map