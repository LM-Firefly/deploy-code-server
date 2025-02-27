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
exports.reLoadCookie = exports.nextChapter = exports.lastChapter = exports.progressUpdate = exports.goProgress = exports.editTemplateCss = exports.editTemplateHtml = exports.searchOnline = exports.openLocalDirectory = exports.clearCollect = exports.cancelCollect = exports.collectBook = exports.editCollectList = exports.collectRefresh = exports.localRefresh = exports.openReaderWebView = void 0;
const index_1 = require("../utils/index");
const store_1 = require("../utils/store");
const vscode_1 = require("vscode");
const reader_1 = require("../reader");
const TreeNode_1 = require("../explorer/TreeNode");
const explorerNodeManager_1 = require("../explorer/explorerNodeManager");
const treeDataProvider_1 = require("../explorer/treeDataProvider");
const PreviewProvider_1 = require("../webview/PreviewProvider");
const config_1 = require("../config");
const ReaderManager_1 = require("../ReaderManager");
const config = require("../utils/config");
const notification_1 = require("../utils/notification");
const request_1 = require("../utils/request");
const path = require("path");
const openReaderWebView = function (treeNode) {
    reader_1.readerDriver.getContent(treeNode).then(function (data) {
        PreviewProvider_1.previewProvider.show(data, treeNode);
    });
};
exports.openReaderWebView = openReaderWebView;
const localRefresh = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const notification = new notification_1.Notification('加载本地小说');
        try {
            const treeNode = yield explorerNodeManager_1.explorerNodeManager.getAllBooks();
            treeDataProvider_1.treeDataProvider.fire();
            explorerNodeManager_1.explorerNodeManager.treeNode = treeNode;
        }
        catch (error) {
            console.warn(error);
        }
        notification.stop();
    });
};
exports.localRefresh = localRefresh;
const collectRefresh = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const notification = new notification_1.Notification('加载收藏列表');
        try {
            const treeNode = [];
            const list = yield config.getConfig('__collect_list', []);
            console.log('__collect_list', list);
            list.forEach((v) => {
                treeNode.push(new TreeNode_1.TreeNode(v));
            });
            treeDataProvider_1.treeDataProvider.fire();
            explorerNodeManager_1.explorerNodeManager.treeNode = treeNode;
        }
        catch (error) {
            console.warn(error);
        }
        notification.stop();
    });
};
exports.collectRefresh = collectRefresh;
const editCollectList = function () {
    vscode_1.workspace.openTextDocument(config.getConfigFile('__collect_list')).then((res) => {
        vscode_1.window.showTextDocument(res, {
            preview: false
        });
    });
};
exports.editCollectList = editCollectList;
const collectBook = function (treeNode) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const list = yield config.getConfig('__collect_list', []);
            console.log(treeNode);
            let isExists = false;
            for (let i = 0; i < list.length; i++) {
                if (treeNode.path === list[i].path && treeNode.type === list[i].type) {
                    isExists = true;
                    break;
                }
            }
            if (isExists) {
                notification_1.showNotification('已收藏该书', 1000);
                return;
            }
            list.push(treeNode.data);
            yield config.setConfig('__collect_list', list);
            notification_1.showNotification('收藏成功', 1000);
        }
        catch (error) {
            console.log(error);
        }
    });
};
exports.collectBook = collectBook;
const cancelCollect = function (treeNode) {
    return __awaiter(this, void 0, void 0, function* () {
        const list = yield config.getConfig('__collect_list', []);
        let bookIndex = null;
        for (let i = 0; i < list.length; i++) {
            if (treeNode.path === list[i].path && treeNode.type === list[i].type) {
                bookIndex = i;
                break;
            }
        }
        if (bookIndex !== null) {
            list.splice(bookIndex, 1);
        }
        yield config.setConfig('__collect_list', list);
        notification_1.showNotification('取消收藏成功', 1000);
    });
};
exports.cancelCollect = cancelCollect;
const clearCollect = function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield config.setConfig('__collect_list', []);
        notification_1.showNotification('清空收藏成功', 1000);
    });
};
exports.clearCollect = clearCollect;
const openLocalDirectory = function () {
    const fileDir = reader_1.readerDriver.getFileDir();
    index_1.mkdir(fileDir);
    index_1.open(fileDir);
};
exports.openLocalDirectory = openLocalDirectory;
const _searchOnline = function (msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const notification = new notification_1.Notification(`搜索: ${msg}`);
        try {
            const vConfig = vscode_1.workspace.getConfiguration('z-reader');
            const onlineSite = vConfig.get('onlineSite', '起点');
            const treeNode = yield reader_1.readerDriver.search(msg, onlineSite);
            treeDataProvider_1.treeDataProvider.fire();
            explorerNodeManager_1.explorerNodeManager.treeNode = treeNode;
        }
        catch (error) {
            console.warn(error);
        }
        notification.stop();
    });
};
const searchOnline = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const msg = yield vscode_1.window.showInputBox({
            password: false,
            ignoreFocusOut: false,
            placeHolder: '请输入小说的名字',
            prompt: ''
        });
        if (msg) {
            _searchOnline(msg);
        }
    });
};
exports.searchOnline = searchOnline;
const editTemplateHtml = function () {
    openTextDocument(path.join(store_1.store.extensionPath, config_1.TemplatePath.templateHtml));
};
exports.editTemplateHtml = editTemplateHtml;
const editTemplateCss = function () {
    openTextDocument(path.join(store_1.store.extensionPath, config_1.TemplatePath.templateCss));
};
exports.editTemplateCss = editTemplateCss;
const openTextDocument = function (path) {
    vscode_1.workspace.openTextDocument(path).then((res) => {
        vscode_1.window.showTextDocument(res, {
            preview: false
        });
    });
};
const goProgress = function () {
    vscode_1.window
        .showInputBox({
        password: false,
        ignoreFocusOut: false,
        placeHolder: '请输入进度: 0-100',
        validateInput: (text) => (/^\d+(\.\d+)?$/.test(text) ? undefined : '请输入数字')
    })
        .then((msg) => {
        PreviewProvider_1.previewProvider.postMessage({
            command: 'goProgress',
            data: {
                progress: Number(msg) * 0.01
            }
        });
    });
};
exports.goProgress = goProgress;
const progressUpdate = function (data) {
    console.log('progressUpdate:', data.progress);
    ReaderManager_1.readerManager.emit('StatusbarUpdateStatusBar', (data.progress * 100).toFixed(2) + '%');
    const treeNode = PreviewProvider_1.previewProvider.getTreeNode();
    if (treeNode && treeNode.type === '.txt' && typeof treeNode.path === 'string') {
        config.set(treeNode.path, 'progress', data.progress);
    }
};
exports.progressUpdate = progressUpdate;
// 上一个章节
const lastChapter = function () {
    const treeNode = PreviewProvider_1.previewProvider.getTreeNode();
    let isSuccess = false;
    if (treeNode) {
        const nextNode = explorerNodeManager_1.explorerNodeManager.lastChapter(treeNode);
        if (nextNode) {
            exports.openReaderWebView(nextNode);
            isSuccess = true;
        }
    }
    if (!isSuccess) {
        notification_1.showNotification('没有上一章了~', 1000);
    }
};
exports.lastChapter = lastChapter;
// 下一个章节
const nextChapter = function () {
    const treeNode = PreviewProvider_1.previewProvider.getTreeNode();
    let isSuccess = false;
    if (treeNode) {
        const nextNode = explorerNodeManager_1.explorerNodeManager.nextChapter(treeNode);
        if (nextNode) {
            exports.openReaderWebView(nextNode);
            isSuccess = true;
        }
    }
    if (!isSuccess) {
        notification_1.showNotification('没有下一章了~', 1000);
    }
};
exports.nextChapter = nextChapter;
// 重新加载cookie
const reLoadCookie = function () {
    request_1.default.reLoadCookie();
    notification_1.showNotification('重新加载cookie完成~', 1000);
};
exports.reLoadCookie = reLoadCookie;
//# sourceMappingURL=index.js.map