"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readerDriver = void 0;
const vscode_1 = require("vscode");
const Fs = require("fs");
const iconv = require("iconv-lite");
class ReaderDriver {
    getEncoding() {
        const vConfig = vscode_1.workspace.getConfiguration('z-reader');
        return vConfig.get('encoding', 'utf8');
    }
    getContent(path) {
        let result = '读取失败';
        try {
            if (this.getEncoding() === 'gbk') {
                result = iconv.decode(Fs.readFileSync(path), 'GB2312');
            }
            else {
                result = Fs.readFileSync(path, 'utf8');
            }
        }
        catch (error) {
            console.warn(error);
        }
        return Promise.resolve(result);
    }
    getChapter() {
        return [];
    }
    hasChapter() {
        return false;
    }
}
exports.readerDriver = new ReaderDriver();
//# sourceMappingURL=index.js.map