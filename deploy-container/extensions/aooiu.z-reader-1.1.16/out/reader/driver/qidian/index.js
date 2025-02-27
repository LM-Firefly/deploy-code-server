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
const cheerio = require("cheerio");
const request_1 = require("../../../utils/request");
const TreeNode_1 = require("../../../explorer/TreeNode");
const DOMAIN = 'https://m.qidian.com';
class ReaderDriver {
    hasChapter() {
        return true;
    }
    search(keyword) {
        return new Promise(function (resolve, reject) {
            request_1.default
                .send(DOMAIN + '/soushu/' + encodeURI(keyword) + '.html')
                .then((res) => {
                const result = [];
                const $ = cheerio.load(res.body);
                $('.book-li').each(function (i, elem) {
                    const title = $(elem).find('.book-title').text();
                    const author = $(elem).find('.book-author').text().trim();
                    const bookIdMatch = $(elem).find('.book-layout').attr().href.match('chapter/(\\d+).');
                    if (bookIdMatch) {
                        result.push(new TreeNode_1.TreeNode(Object.assign({}, TreeNode_1.defaultTreeNode, {
                            type: '.qidian',
                            name: `${title} - ${author}`,
                            isDirectory: true,
                            path: JSON.stringify({ bookId: bookIdMatch[1] })
                        })));
                    }
                });
                resolve(result);
            })
                .catch((reason) => {
                reject(reason);
            });
        });
    }
    getChapter(pathStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bookId } = JSON.parse(pathStr);
            const res = yield request_1.default.send(DOMAIN + '/book/' + bookId + '/catalog').catch((err) => console.warn(err));
            if (!res) {
                return [];
            }
            const result = [];
            const regEx = /g_data.volumes = (.*?)\n/.exec(res.body);
            try {
                if (regEx) {
                    const data = eval(regEx[1]);
                    data.forEach((e) => {
                        e.cs.forEach((cs) => {
                            result.push(new TreeNode_1.TreeNode(Object.assign({}, TreeNode_1.defaultTreeNode, {
                                type: '.qidian',
                                name: cs.cN,
                                isDirectory: false,
                                path: JSON.stringify({ bookUrl: DOMAIN + `/book/${bookId}/${cs.id}` })
                            })));
                        });
                    });
                }
            }
            catch (error) {
                console.warn(error);
            }
            return result;
        });
    }
    getContent(pathStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bookUrl } = JSON.parse(pathStr);
            const res = yield request_1.default.send(bookUrl).catch((err) => console.warn(err));
            if (!res) {
                return '读取章节失败';
            }
            const $ = cheerio.load(res.body);
            let txt = $('#chapterContent .read-section p')
                .map(function (i, el) {
                return $(el).text();
            })
                .get()
                .join('\r\n');
            // 收费章节提示
            txt += $('.read-rss-auto-left').text();
            return txt;
        });
    }
}
exports.readerDriver = new ReaderDriver();
//# sourceMappingURL=index.js.map