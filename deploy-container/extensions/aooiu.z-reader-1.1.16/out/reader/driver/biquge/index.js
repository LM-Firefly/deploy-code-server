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
const DOMAIN = 'http://www.xbiquzw.com';
class ReaderDriver {
    hasChapter() {
        return true;
    }
    search(keyword) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            try {
                const res = yield request_1.default.send(DOMAIN + '/modules/article/search.php?searchkey=' + encodeURI(keyword));
                const $ = cheerio.load(res.body);
                $('.grid tbody > tr').each(function (i, elem) {
                    const title = $(elem).find('td:nth-child(1)').text();
                    const author = $(elem).find('td:nth-child(3)').text();
                    const path = $(elem).find('td:nth-child(1)').find('a').attr('href');
                    if (title && author) {
                        result.push(new TreeNode_1.TreeNode(Object.assign({}, TreeNode_1.defaultTreeNode, {
                            type: '.biquge',
                            name: `${title} - ${author}`,
                            isDirectory: true,
                            path
                        })));
                    }
                });
            }
            catch (error) {
                console.warn(error);
            }
            return result;
        });
    }
    getChapter(pathStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            try {
                const res = yield request_1.default.send(DOMAIN + pathStr);
                const $ = cheerio.load(res.body);
                $('#list dd').each(function (i, elem) {
                    const name = $(elem).find('a').text();
                    const path = $(elem).find('a').attr().href;
                    result.push(new TreeNode_1.TreeNode(Object.assign({}, TreeNode_1.defaultTreeNode, {
                        type: '.biquge',
                        name,
                        isDirectory: false,
                        path: pathStr + path
                    })));
                });
            }
            catch (error) {
                console.warn(error);
            }
            return result;
        });
    }
    getContent(pathStr) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = '';
            try {
                const res = yield request_1.default.send(DOMAIN + pathStr);
                const $ = cheerio.load(res.body);
                const html = $('#content').html();
                result = html ? html : '';
            }
            catch (error) {
                console.warn(error);
            }
            return result;
        });
    }
}
exports.readerDriver = new ReaderDriver();
//# sourceMappingURL=index.js.map