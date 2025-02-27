"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readerDriver = void 0;
const epub = require("epub");
const TreeNode_1 = require("../../../explorer/TreeNode");
class ReaderDriver {
    getChapter(path) {
        return new Promise((resolve) => {
            const book = new epub(path);
            book.on('end', function () {
                resolve(book.flow.map(function (e) {
                    return new TreeNode_1.TreeNode(Object.assign({}, TreeNode_1.defaultTreeNode, {
                        type: '.epub',
                        name: e.title || e.id,
                        isDirectory: false,
                        path: JSON.stringify({ path, chapterId: e.id })
                    }));
                }));
            });
            book.parse();
        });
    }
    getContent(pathStr) {
        const { path, chapterId } = JSON.parse(pathStr);
        return new Promise((resolve, reject) => {
            const book = new epub(path);
            book.on('end', () => {
                book.getChapter(chapterId, (error, text) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(text);
                });
            });
            book.parse();
        });
    }
    hasChapter() {
        return true;
    }
}
exports.readerDriver = new ReaderDriver();
//# sourceMappingURL=index.js.map