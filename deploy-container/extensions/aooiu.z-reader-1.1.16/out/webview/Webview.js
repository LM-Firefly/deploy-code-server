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
exports.Webview = void 0;
const vscode_1 = require("vscode");
class Webview {
    constructor() {
        this.viewType = 'zReader.webview';
        this.listeners = [];
    }
    dispose() {
        // if (this.panel) {
        //   this.panel.dispose();
        // }
        this.panel = undefined;
        for (const listener of this.listeners) {
            listener.dispose();
        }
        this.listeners = [];
    }
    showWebviewInternal() {
        const { title, viewColumn, preserveFocus } = this.getWebviewOption();
        if (!this.panel) {
            this.panel = vscode_1.window.createWebviewPanel(this.viewType, title, { viewColumn, preserveFocus }, {
                enableScripts: true,
                enableCommandUris: true,
                enableFindWidget: true,
                retainContextWhenHidden: true
            });
            this.panel.onDidDispose(this.onDidDisposeWebview, this, this.listeners);
            // 通过使用侦听器函数作为参数调用事件来表示您要订阅的事件的函数。
            this.panel.webview.onDidReceiveMessage(this.onDidReceiveMessage, this, this.listeners);
            // 通过使用侦听器函数作为参数调用事件来表示您要订阅的事件的函数。
            vscode_1.workspace.onDidChangeConfiguration(this.onDidChangeConfiguration, this, this.listeners);
        }
        else {
            this.panel.title = title;
        }
        this.panel.webview.html = this.getWebviewContent();
    }
    onDidDisposeWebview() {
        this.panel = undefined;
        for (const listener of this.listeners) {
            listener.dispose();
        }
        this.listeners = [];
    }
    postMessage(iWebViewMessage) {
        if (!this.panel) {
            return;
        }
        this.panel.webview.postMessage(iWebViewMessage);
    }
    onDidChangeConfiguration(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.panel && event.affectsConfiguration('markdown')) {
                this.panel.webview.html = this.getWebviewContent();
            }
        });
    }
}
exports.Webview = Webview;
//# sourceMappingURL=Webview.js.map