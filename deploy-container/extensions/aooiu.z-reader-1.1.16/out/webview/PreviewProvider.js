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
exports.previewProvider = void 0;
const vscode_1 = require("vscode");
const Webview_1 = require("./Webview");
const config_1 = require("../config");
const workspaceConfiguration_1 = require("../utils/workspaceConfiguration");
class PreviewProvider extends Webview_1.Webview {
    constructor() {
        super(...arguments);
        this.node = '';
    }
    show(node, treeNode) {
        this.node = node;
        this.treeNode = treeNode;
        this.showWebviewInternal();
    }
    getTreeNode() {
        return this.treeNode;
    }
    getWebviewContent() {
        return this.node;
    }
    getWebviewOption() {
        var _a;
        let title = workspaceConfiguration_1.default().get('readerViewTitle', '');
        title = title.replace(new RegExp('\\${name}', 'g'), ((_a = this.treeNode) === null || _a === void 0 ? void 0 : _a.name) || '');
        return {
            title,
            viewColumn: vscode_1.ViewColumn.Active
        };
    }
    onDidReceiveMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('onDidReceiveMessage:', message);
            switch (message.command) {
                case config_1.WebViewMessage.editStyle: {
                    vscode_1.commands.executeCommand(config_1.Commands.editTemplateCss);
                    break;
                }
                case config_1.WebViewMessage.editHtml: {
                    vscode_1.commands.executeCommand(config_1.Commands.editTemplateHtml);
                    break;
                }
                case config_1.WebViewMessage.goProgress: {
                    vscode_1.commands.executeCommand(config_1.Commands.goProgress);
                    break;
                }
                case config_1.WebViewMessage.progressUpdate: {
                    vscode_1.commands.executeCommand(config_1.Commands.progressUpdate, message.data);
                    break;
                }
                case config_1.WebViewMessage.lastChapter: {
                    vscode_1.commands.executeCommand(config_1.Commands.lastChapter);
                    break;
                }
                case config_1.WebViewMessage.nextChapter: {
                    vscode_1.commands.executeCommand(config_1.Commands.nextChapter);
                    break;
                }
            }
        });
    }
}
exports.previewProvider = new PreviewProvider();
//# sourceMappingURL=PreviewProvider.js.map