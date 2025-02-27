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
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const Statusbar_1 = require("./Statusbar");
const config_1 = require("./config");
const store_1 = require("./utils/store");
const workspaceConfiguration_1 = require("./utils/workspaceConfiguration");
const treeDataProvider_1 = require("./explorer/treeDataProvider");
const Path = require("path");
const commands_1 = require("./commands");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('activate');
        // store
        store_1.store.extensionPath = context.extensionPath;
        store_1.store.booksPath = Path.join(context.extensionPath, 'book');
        store_1.store.globalStorageUri = context.globalStorageUri;
        context.subscriptions.push(Statusbar_1.statusbar, treeDataProvider_1.treeDataProvider, 
        // 点击事件
        vscode_1.commands.registerCommand(config_1.Commands.openReaderWebView, commands_1.openReaderWebView), 
        // 刷新
        vscode_1.commands.registerCommand(config_1.Commands.localRefresh, () => {
            vscode_1.commands.executeCommand('setContext', 'zreader.panel', 'local');
            commands_1.localRefresh();
        }), 
        // 打开本地目录
        vscode_1.commands.registerCommand(config_1.Commands.openLocalDirectory, commands_1.openLocalDirectory), 
        // 搜索 - 起点
        vscode_1.commands.registerCommand(config_1.Commands.searchOnline, () => {
            vscode_1.commands.executeCommand('setContext', 'zreader.panel', 'online');
            commands_1.searchOnline();
        }), vscode_1.commands.registerCommand(config_1.Commands.editTemplateHtml, commands_1.editTemplateHtml), vscode_1.commands.registerCommand(config_1.Commands.editTemplateCss, commands_1.editTemplateCss), vscode_1.commands.registerCommand(config_1.Commands.goProgress, commands_1.goProgress), vscode_1.commands.registerCommand(config_1.Commands.progressUpdate, commands_1.progressUpdate), vscode_1.commands.registerCommand(config_1.Commands.lastChapter, commands_1.lastChapter), vscode_1.commands.registerCommand(config_1.Commands.nextChapter, commands_1.nextChapter), 
        // 加载收藏列表
        vscode_1.commands.registerCommand(config_1.Commands.collectRefresh, () => {
            vscode_1.commands.executeCommand('setContext', 'zreader.panel', 'collect');
            commands_1.collectRefresh();
        }), 
        // 编辑收藏列表
        vscode_1.commands.registerCommand(config_1.Commands.editCollectList, () => commands_1.editCollectList), 
        // 收藏书籍
        vscode_1.commands.registerCommand(config_1.Commands.collectBook, commands_1.collectBook), 
        // 取消收藏书籍
        vscode_1.commands.registerCommand(config_1.Commands.cancelCollect, commands_1.cancelCollect), 
        // 清空收藏
        vscode_1.commands.registerCommand(config_1.Commands.clearCollect, commands_1.clearCollect), 
        // 设置
        vscode_1.commands.registerCommand(config_1.Commands.setOnlineSite, () => __awaiter(this, void 0, void 0, function* () {
            const onlineSite = workspaceConfiguration_1.default().get('onlineSite');
            // 没有找到 showQuickPick 接口设置选中项的配置, 所以这里排序将当前设置置顶
            const items = [{ label: '起点' }, { label: '笔趣阁' }]
                .map((e) => (Object.assign(Object.assign({}, e), { description: e.label === onlineSite ? '当前设置' : '' })))
                .sort((e) => (e.label === onlineSite ? -1 : 0));
            const result = yield vscode_1.window.showQuickPick(items, {
                placeHolder: '在线搜索来源网站, 当前设置: ' + onlineSite,
                canPickMany: false
            });
            if (result && result.label) {
                workspaceConfiguration_1.default().update('onlineSite', result.label, true);
            }
        })), vscode_1.commands.registerCommand(config_1.Commands.setEncoding, () => __awaiter(this, void 0, void 0, function* () {
            const encoding = workspaceConfiguration_1.default().get('encoding', 'utf8');
            const result = yield vscode_1.window.showQuickPick([
                {
                    label: 'utf8'
                },
                {
                    label: 'gbk'
                }
            ], {
                placeHolder: 'txt文件打开编码, 当前设置: ' + encoding,
                canPickMany: false
            });
            if (result && result.label) {
                workspaceConfiguration_1.default().update('encoding', result.label, true);
            }
        })), 
        // 设置章节顺序
        vscode_1.commands.registerCommand(config_1.Commands.setChapterOrder, () => __awaiter(this, void 0, void 0, function* () {
            const chapterOrder = workspaceConfiguration_1.default().get('chapterOrder', '顺序');
            const result = yield vscode_1.window.showQuickPick([
                {
                    label: '顺序'
                },
                {
                    label: '倒序'
                }
            ], {
                placeHolder: '章节显示顺序, 当前设置: ' + chapterOrder,
                canPickMany: false
            });
            if (result && result.label) {
                workspaceConfiguration_1.default().update('chapterOrder', result.label, true);
            }
        })), 
        // 注册 TreeView
        vscode_1.window.createTreeView(config_1.TREEVIEW_ID, {
            treeDataProvider: treeDataProvider_1.treeDataProvider,
            showCollapseAll: true
        }));
        // localRefresh();
        vscode_1.workspace.onDidChangeConfiguration(function (event) {
            console.log(event);
            if (event.affectsConfiguration('z-reader')) {
                commands_1.reLoadCookie();
            }
        });
    });
}
exports.activate = activate;
function deactivate() {
    console.log('eactivate.');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map