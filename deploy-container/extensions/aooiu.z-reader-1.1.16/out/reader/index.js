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
exports.readerDriver = void 0;
const vscode_1 = require("vscode");
const Path = require("path");
const Fs = require("fs");
const TreeNode_1 = require("../explorer/TreeNode");
const index_1 = require("../utils/index");
const store_1 = require("../utils/store");
const config = require("../utils/config");
const config_1 = require("../config");
class ReaderDriver {
    constructor() {
        this.getSearchDriver = function (onlineSite) {
            switch (onlineSite) {
                case '起点':
                    return './driver/qidian';
                case '笔趣阁':
                    return './driver/biquge';
                default:
                    return './driver/qidian';
            }
        };
    }
    getLocalBooks(path) {
        const drivers = this.getDrivers();
        return new Promise(function (resolve, reject) {
            if (!Fs.lstatSync(path).isDirectory()) {
                reject('读取目录失败');
                return;
            }
            Fs.readdir(path, (err, files) => {
                if (err || !files) {
                    reject(err);
                }
                const result = files
                    .filter((file) => {
                    return drivers.includes(Path.extname(file).substr(1));
                })
                    .sort((a, b) => {
                    const am = a.match(/[\u4e00-\u9fa5]/g);
                    const bm = b.match(/[\u4e00-\u9fa5]/g);
                    const as = am ? am.join('') : a;
                    const bs = bm ? bm.join('') : b;
                    const _an = a.match(/\d+/g);
                    const _bn = b.match(/\d+/g);
                    const an = _an ? Number(_an.join('')) : 0;
                    const bn = _bn ? Number(_bn.join('')) : 0;
                    if (as === bs) {
                        return an > bn ? 1 : -1;
                    }
                    return as > bs ? -1 : 1;
                });
                resolve(result);
            });
        });
    }
    getContent(treeNode) {
        console.log(treeNode);
        return new Promise(function (resolve) {
            Promise.resolve().then(() => require('./driver/' + treeNode.type.substr(1))).then(({ readerDriver }) => readerDriver.getContent(treeNode.path))
                .then((text) => {
                const html = index_1.template(store_1.store.extensionPath, config_1.TemplatePath.templateHtml, {
                    progress: config.get(treeNode.path, 'progress'),
                    contentType: 'html',
                    content: text
                });
                resolve(html);
            });
        });
    }
    getChapter(treeNode) {
        return new Promise(function (resolve) {
            Promise.resolve().then(() => require('./driver/' + treeNode.type.substr(1))).then(({ readerDriver }) => {
                resolve(readerDriver.getChapter(treeNode.path));
            })
                .catch(() => {
                resolve([]);
            });
        });
    }
    getDrivers() {
        const driversPath = Path.resolve(__filename, '.././driver');
        const drivers = Fs.readdirSync(driversPath);
        return drivers;
    }
    hasChapter() {
        const drivers = this.getDrivers();
        const promiseFn = [];
        for (let i = 0; i < drivers.length; i++) {
            const _promise = new Promise(function (resolve) {
                Promise.resolve().then(() => require('./driver/' + drivers[i])).then(({ readerDriver }) => {
                    resolve({
                        [drivers[i]]: readerDriver.hasChapter()
                    });
                });
            });
            promiseFn.push(_promise);
        }
        return new Promise(function (resolve) {
            Promise.all(promiseFn).then((data) => {
                resolve(Object.assign({}, ...data));
            });
        });
    }
    getFileDir() {
        const fileDir = vscode_1.workspace.getConfiguration('z-reader').get('fileDir', store_1.store.booksPath);
        return fileDir ? fileDir : store_1.store.booksPath;
    }
    // 获取列表
    getAllBooks() {
        return __awaiter(this, void 0, void 0, function* () {
            const fileDir = this.getFileDir();
            const result = [];
            try {
                const chapters = yield this.hasChapter();
                const filePaths = yield this.getLocalBooks(fileDir);
                filePaths.forEach((filePath) => {
                    const extname = Path.extname(filePath);
                    result.push(new TreeNode_1.TreeNode(Object.assign({}, TreeNode_1.defaultTreeNode, {
                        type: extname,
                        name: filePath,
                        isDirectory: chapters[extname.substr(1)],
                        path: Path.join(fileDir, filePath)
                    })));
                });
            }
            catch (error) {
                console.log(error);
                vscode_1.window.showWarningMessage('读取目录失败, 请检测您的目录设置');
            }
            return result;
        });
    }
    search(keyword, onlineSite) {
        return new Promise((resolve, reject) => {
            Promise.resolve().then(() => require(this.getSearchDriver(onlineSite))).then(({ readerDriver }) => {
                resolve(readerDriver.search(keyword));
            })
                .catch((error) => reject(error));
        });
    }
}
exports.readerDriver = new ReaderDriver();
//# sourceMappingURL=index.js.map